from django.urls import path
from .views import BookListView, BookDetailView, BookCreateView, RelatedBooksView
from rest_framework.routers import DefaultRouter

# router = DefaultRouter()
# router.register(r'books', BookViewSet)

urlpatterns = [
    path('', BookListView.as_view()),
    path('<int:pk>', BookDetailView.as_view()),
    path('create', BookCreateView.as_view()),
    path('<int:pk>/related', RelatedBooksView.as_view()),
] 
# + router.urls
