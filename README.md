# Open Book

Open Book is a full-stack document intelligence platform for scraped book data. It collects books from the web, stores metadata in Django/MySQL, embeds descriptions into ChromaDB, generates AI insights with OpenAI, and lets users ask questions over the indexed book collection from a React frontend.

## Features

- Selenium scraper for `books.toscrape.com`
- Django REST Framework backend
- MySQL metadata storage
- Persistent ChromaDB vector storage
- SentenceTransformer embeddings
- OpenAI-powered RAG answers
- AI-generated book summary and genre
- Related-books API
- React + Tailwind CSS frontend
- Book listing, book detail, recommendations, and Q&A interface

## Tech Stack

| Layer | Technology |
| --- | --- |
| Backend | Django, Django REST Framework |
| Database | MySQL |
| Vector Store | ChromaDB persistent client |
| Embeddings | `sentence-transformers/all-MiniLM-L6-v2` |
| AI | OpenAI Responses API (https://openrouter.ai for free api) |
| Scraper | Selenium, BeautifulSoup |
| Frontend | React, Vite, Tailwind CSS |

## Project Structure

```text
Open_book/
├── books/                 # Book model, serializers, book APIs
├── rag/                   # RAG endpoint, embeddings, vector store, AI insights
├── scraper/               # Selenium scraping pipeline
├── frontend/              # React + Tailwind UI
├── Open_book/             # Django project settings and root URLs
├── requirements.txt
└── README.md
```

## Screenshots

Add your final screenshots here before submitting the assignment:

## Dashboard 

| <img width="1920" height="925" alt="Screenshot From 2026-04-17 06-22-22" src="https://github.com/user-attachments/assets/7d4462d1-f2f6-4787-8189-892cf245e117" />
 

## Q&A Interface / Book Detail 
| <img width="1920" height="925" alt="Screenshot From 2026-04-17 06-22-48" src="https://github.com/user-attachments/assets/ee0a3e7c-6f9c-4140-b561-861c88420f2d" />

## Recommendations 
 | <img width="1920" height="269" alt="Screenshot From 2026-04-17 06-23-14" src="https://github.com/user-attachments/assets/e87caede-0197-481c-b752-7131090c71bf" />


## Backend Setup

Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update `.env` with your MySQL and OpenAI settings:

```env
DB_NAME=books_data
DB_USER=django_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=3306

OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

CHROMA_DB_PATH=./chroma_db
```

Run migrations:

```bash
python manage.py makemigrations
python manage.py migrate
```

Start the Django backend:

```bash
python manage.py runserver
```

Backend URL:

```text
http://127.0.0.1:8000
```

## Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://127.0.0.1:5173
```

If your frontend cannot reach the backend, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Scraping Books

The scraper uses Selenium to open pages from `books.toscrape.com`, extract book data, and POST it to the backend create API.

Make sure the backend is running first:

```bash
python manage.py runserver
```

Then run:

```bash
python scraper/scraper.py
```

By default it scrapes one sample book:

```python
scrap_book("https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html")
```

To scrape multiple pages, uncomment this line in [scraper/scraper.py](scraper/scraper.py):

```python
scrape_pages(start_page=1, end_page=50)
```

## API Documentation

### List Books

```http
GET /api/books/
```

Returns all uploaded books.

Example response:

```json
[
  {
    "id": 1,
    "title": "Tipping the Velvet",
    "description": "Book description...",
    "rating": 1.0,
    "url": "https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html",
    "img_url": "https://books.toscrape.com/media/cache/...",
    "ai_summary": "Short AI summary...",
    "genre": "Historical Fiction"
  }
]
```

### Create / Process Book

```http
POST /api/books/create
```

Example body:

```json
{
  "title": "Tipping the Velvet",
  "description": "Book description...",
  "rating": 1,
  "url": "https://books.toscrape.com/catalogue/tipping-the-velvet_999/index.html",
  "img_url": "https://books.toscrape.com/media/cache/..."
}
```

Processing steps:

1. Save book metadata to MySQL.
2. Generate AI summary and genre.
3. Chunk the description.
4. Generate embeddings.
5. Store chunks in persistent ChromaDB.

### Book Detail

```http
GET /api/books/<id>
```

Returns one book with metadata and AI insights.

### Related Books

```http
GET /api/books/<id>/related
```

Returns up to five related books. Current logic scores books using title-word overlap plus rating.

### Ask A Question

```http
POST /api/rag/ask/
```

Example body:

```json
{
  "question": "What is this book about?"
}
```

Example response:

```json
{
  "question": "What is this book about?",
  "answer": "The book is about ... [Source 1]",
  "Answer": "The book is about ... [Source 1]"
}
```

## Sample Questions

Try these after scraping a few books:

- What is Tipping the Velvet about?
- Which book has the darkest tone?
- Recommend a book with a romantic or historical theme.
- What themes appear across the indexed books?

## RAG Pipeline

The RAG flow is:

1. User asks a question.
2. The question is embedded using SentenceTransformers.
3. ChromaDB returns the most similar book chunks.
4. Relevant chunks are inserted into an OpenAI prompt.
5. OpenAI generates a contextual answer with source labels.

## Notes

- `books.toscrape.com` does not provide authors, so this project does not include an author field.
- ChromaDB data is stored locally in `./chroma_db` by default.
- `.env`, `venv`, `node_modules`, and generated vector data are ignored by Git.

## Submission Checklist

- Add 3-4 screenshots to the README.
- Confirm backend starts with `python manage.py runserver`.
- Confirm frontend starts with `npm run dev`.
- Scrape sample books.
- Ask sample questions through the UI.
- Push code to GitHub.
- Submit the GitHub repository link in the assignment form.
