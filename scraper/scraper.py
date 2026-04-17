import time
from urllib.parse import urljoin

import bs4
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))


base_url = "https://books.toscrape.com/catalogue/page-%s.html"
book_url_prefix = "https://books.toscrape.com/catalogue/"
post_url = "http://127.0.0.1:8000/api/books/create"


def create_driver():
    options = Options()
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,900")
    return webdriver.Chrome(options=options)


def load_soup(driver, url):
    driver.get(url)
    WebDriverWait(driver, 15).until(
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )
    time.sleep(0.5)
    return bs4.BeautifulSoup(driver.page_source, "html.parser")


def scrap_book(url, driver=None):
    close_driver = driver is None
    driver = driver or create_driver()

    try:
        soup = load_soup(driver, url)
        book_title = soup.find("li", {"class": "active"}).text.strip()
        book_desc = soup.find("meta", {"name": "description"}).get("content").strip()
        img_tag = soup.find("div", class_="item active").find("img")
        book_image_url = urljoin(url, img_tag.get("src"))

        rating_map = {
            "One": 1,
            "Two": 2,
            "Three": 3,
            "Four": 4,
            "Five": 5,
        }
        rating_word = soup.find("p", {"class": "star-rating"})["class"][1]
        book_rating = rating_map.get(rating_word)

        data = {
            "title": book_title,
            "description": book_desc,
            "rating": book_rating,
            "url": url,
            "img_url": book_image_url,
        }
        response = requests.post(post_url, data=data, timeout=60)
        print(response.status_code)
        print(response.json())
    finally:
        if close_driver:
            driver.quit()


def scrape_page(page_number, driver):
    soup = load_soup(driver, base_url % page_number)
    books = soup.find_all(
        "li",
        {"class": "col-xs-6 col-sm-4 col-md-3 col-lg-3"},
    )

    for book in books:
        book_url = urljoin(book_url_prefix, book.find("a").get("href"))
        scrap_book(book_url, driver=driver)


def scrape_pages(start_page=1, end_page=1):
    driver = create_driver()
    try:
        for page_number in range(start_page, end_page + 1):
            scrape_page(page_number, driver)
    finally:
        driver.quit()


if __name__ == "__main__":
    # scrap_book("https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html")
    scrape_pages(start_page=1, end_page=10)
