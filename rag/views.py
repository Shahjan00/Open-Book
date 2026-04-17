from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.rag_pipeline import run_rag


class AskQuestionView(APIView):
    def post(self, request):
        question = request.data.get("question")
        if not question:
            return Response(
                {"error": "question is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            answer = run_rag(question)
        except ValueError as error:
            return Response(
                {"error": str(error)},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as error:
            return Response(
                {"error": f"Could not generate answer: {error}"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        return Response({"question": question, "answer": answer, "Answer": answer})
