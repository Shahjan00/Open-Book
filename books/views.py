from django.shortcuts import render
from rest_framework import generics, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import BookSerializer
from .models import Book
from rag.services.embedding import get_embedding
from rag.services.vector_store import store_embedding
from rag.services.ai_insights import generate_book_insights

# Create your views here.

class BookListView(generics.ListAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

class BookCreateView(generics.CreateAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    def perform_create(self, serializer):
        book = serializer.save()
        text = book.description
        insights = generate_book_insights(book.title, book.description)
        book.ai_summary = insights["summary"]
        book.genre = insights["genre"]
        book.save()
        chunks = []
        chunk_size = 200

        for i in range(0,len(text), chunk_size):
            chunk = text[i:i+chunk_size]
            chunks.append(chunk)

        for index, chunk in enumerate(chunks):
            embedding = get_embedding(chunk)
            store_embedding(
                doc_id=f'{book.id}-{index}',
                text=chunk,
                embedding=embedding
            )
            print(embedding)
        
        


class BookDetailView(generics.RetrieveAPIView):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

# class BookViewSet(viewsets.ModelViewSet):
#     queryset = Book.objects.all()
#     serializer_class = BookSerializer

class RelatedBooksView(APIView):
    def get(self, request, pk):
        try:
            book = Book.objects.get(pk=pk)
        except Book.DoesNotExist:
            return Response({"error": "Book not found"}, status=404)

        title_words = book.title.lower().split()

        related_books = Book.objects.exclude(id=book.id)

        scored_books = []
        for other_book in related_books:
            other_title = other_book.title.lower()
            score = sum(1 for word in title_words if word in other_title)

            if other_book.rating:
                score += float(other_book.rating) * 0.2

            scored_books.append((score, other_book))

        scored_books.sort(key=lambda item: item[0], reverse=True)

        books = [item[1] for item in scored_books[:5]]
        serializer = BookSerializer(books, many=True)

        return Response(serializer.data)