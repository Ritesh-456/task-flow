from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from openai import OpenAI
import os
from django.conf import settings

# This view uses an LLM to answer questions about the user's tasks
class ChatView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        message = request.data.get('message', '')
        
        # Simple simulated contextual response for demo purposes
        # Since we might not have a real OPENAI_API_KEY in all environments
        
        response_text = "I am your TaskFlow Assistant. "
        
        if "task" in message.lower() or "tasks" in message.lower():
            response_text += "You can find your tasks primarily in the Kanban board or by checking the Analytics dashboard."
        elif "project" in message.lower():
            response_text += "Your projects are managed in the Projects tab on the sidebar. Admins can create new ones."
        elif "hello" in message.lower() or "hi" in message.lower():
            response_text += "Hello! How can I help you manage your productivity today?"
        else:
            response_text += f"You said: '{message}'. I'm currently running in simulated mode, so I can handle basic queries about Tasks and Projects."

        return Response({
            "response": response_text
        })
