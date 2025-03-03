# client side python app for AIEmailResponder
# work with web service

import requests  # calling web service
import jsons  # relational-object mapping

API_URL = "https://your-api-gateway-url"  # replace with actual API Gateway URL

def main():
    print("AI Email Responder")
    email_text = input("Paste the email content:\n")
    tone = input("Choose tone (formal, casual, apologetic): ").strip().lower()

    payload = {"email": email_text, "tone": tone}
    response = requests.post(API_URL, json=payload)

    if response.status_code == 200:
        data = response.json()
        print("\n📝 AI-Generated Response:\n")
        print(data["reply"])
    else:
        print("Error with code:", response.status_code)
        print(response.text)

if __name__ == "__main__":
    main()