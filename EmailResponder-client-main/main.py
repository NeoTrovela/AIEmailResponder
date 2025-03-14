# client side python app for AIEmailResponder
# work with web service

import requests  # calling web service
import jsons  # relational-object mapping

import logging
import time
import os

import openai

###################################################################
#
# web_service_get
#
# When calling servers on a network, calls can randomly fail. 
# The better approach is to repeat at least N times (typically 
# N=3), and then give up after N tries.
#
def web_service_get(url):
    """
    Submits a GET request to a web service at most 3 times, since 
    web services can fail to respond e.g. to heavy user or internet 
    traffic. If the web service responds with status code 200, 400 
    or 500, we consider this a valid response and return the response.
    Otherwise we try again, at most 3 times. After 3 attempts the 
    function returns with the last response.

    Parameters
    ----------
    url: url for calling the web service

    Returns
    -------
    response received from web service
    """

    try:
        retries = 0

        while True:
            response = requests.get(url)
            
            if response.status_code in [200, 400, 500]:
            #
            # we consider this a successful call and response
            #
                break

            #
            # failed, try again?
            #
            retries = retries + 1
            if retries < 3:
            # try at most 3 times
                time.sleep(retries)
                continue
                
            #
            # if get here, we tried 3 times, we give up:
            #
            break

        return response

    except Exception as e:
        print("**ERROR**")
        logging.error("web_service_get() failed:")
        logging.error("url: " + url)
        logging.error(e)
        return None
  
def web_service_put(url, data):
    """
    Submits a PUT request to a web service at most 3 times, since 
    web services can fail to respond e.g. to heavy user or internet 
    traffic. If the web service responds with status code 200, 400 
    or 500, we consider this a valid response and return the response.
    Otherwise we try again, at most 3 times. After 3 attempts the 
    function returns with the last response.

    Parameters
    ----------
    url: url for calling the web service

    Returns
    -------
    response received from web service
    """

    try:
        retries = 0

        while True:
            response = requests.put(url, json=data)
            
            if response.status_code in [200, 400, 500]:
            #
            # we consider this a successful call and response
            #
                break

            #
            # failed, try again?
            #
            retries = retries + 1
            if retries < 3:
            # try at most 3 times
                time.sleep(retries)
                continue
                
            #
            # if get here, we tried 3 times, we give up:
            #
            break

        return response

    except Exception as e:
        print("**ERROR**")
        logging.error("web_service_get() failed:")
        logging.error("url: " + url)
        logging.error(e)
        return None

def web_service_post(url, data):
    """
    Submits a POST request to a web service at most 3 times, since 
    web services can fail to respond e.g. to heavy user or internet 
    traffic. If the web service responds with status code 200, 400 
    or 500, we consider this a valid response and return the response.
    Otherwise we try again, at most 3 times. After 3 attempts the 
    function returns with the last response.

    Parameters
    ----------
    url: url for calling the web service

    Returns
    -------
    response received from web service
    """

    try:
        retries = 0

        while True:
            response = requests.post(url, json=data)
            
            if response.status_code in [200, 400, 500]:
            #
            # we consider this a successful call and response
            #
                break

            #
            # failed, try again?
            #
            retries = retries + 1
            if retries < 3:
            # try at most 3 times
                time.sleep(retries)
                continue
                
            #
            # if get here, we tried 3 times, we give up:
            #
            break

        return response

    except Exception as e:
        print("**ERROR**")
        logging.error("web_service_get() failed:")
        logging.error("url: " + url)
        logging.error(e)
        return None
  
API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = API_KEY

def generate_response(email, tone):
    """
    Sends a request to OpenAI's API to generate an AI-powered email response.

    Parameters
    ----------
    email_text : The input email text (str)
    tone : The desired tone of the response (formal, casual, apologetic, etc.) (str)

    Returns
    -------
    AI-generated email response (str)
    """

    try:
        client = openai.OpenAI(api_key=API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": f"You're an AI email assistant. Respond to this email in a {tone} tone."},
                {"role": "user", "content": email}
            ]
        )
        
        # get response text
        return response.choices[0]["message"]["content"]

    except Exception as e:
        print("Error:", e)
        return None

def main():
    print("AI Email Responder")
    print("Paste email content> ")
    email_text = input()
    print("Choose tone (formal, casual, apologetic, etc.)> ")
    tone = input().strip().lower()

    response = generate_response(email_text, tone)

    if response:
        print("**AI Generated Response**")
        print(response)
    else:
        print("**ERROR**")
        print("Failed to generate response :(")

    #payload = {"email": email_text, "tone": tone}
    #response = web_service_post(API_KEY, json=payload)

    #if response.status_code == 200: # success
    #    data = response.json()
    #    print("\nAI-Generated Response:\n")
    #    print(data["reply"])
    #else: # error code
    #    print("Error with code:", response.status_code)
    #    print(response.text)

if __name__ == "__main__":
    main()