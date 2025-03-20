# client side python app for AIEmailResponder
# work with web service

import requests  # calling web service
import jsons  # relational-object mapping

import logging
import time
import os

from configparser import ConfigParser

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
  
#API_KEY = os.getenv("OPENAI_API_KEY")
#openai.api_key = API_KEY

###################################################################
#
# prompt
#
def prompt():
  """
  Prompts the user and returns the command number
  
  Parameters
  ----------
  None
  
  Returns
  -------
  Command number entered by user (0, 1, 2, ...)
  """

  try:
    print()
    print(">> Enter a command:")
    print("   0 => end")
    print("   1 => generate response")
    print("   2 => get history")
    print("   3 => add/update user")

    cmd = int(input())
    return cmd

  except Exception as e:
    print("ERROR")
    print("ERROR: invalid input")
    print("ERROR")
    return -1
  
###################################################################
#
# add_user
#
def add_user(baseurl):
  """
  Prompts the user for the new user's email,
  last name, and first name, and then inserts
  this user into the database. But if the user's
  email already exists in the database, then we
  update the user's info instead of inserting
  a new user.
  
  Parameters
  ----------
  baseurl: baseurl for web service
  
  Returns
  -------
  nothing
  """

  try:
    print("Enter user's email>")
    email = input()

    print("Enter user's last (family) name>")
    last_name = input()

    print("Enter user's first (given) name>")
    first_name = input()

    #
    # build the data packet:
    #
    # TODO
    #
    data = {
      "email": email,
      "lastname": last_name,
      "firstname": first_name
    }

    #
    # call the web service:
    #
    api = '/user'
    url = baseurl + api
    
    #
    # TODO
    #
    # res = requests.???(url, json=???)
    #
    res = web_service_put(url, data) # function to try request at least 3 times
    #res = requests.put(url, json=data)

    #
    # let's look at what we got back:
    #
    if res.status_code != 200:
      # failed:
      print("Failed with status code:", res.status_code)
      print("url: " + url)
      if res.status_code in [400, 500]:  # we'll have an error message
        body = res.json()
        print("Error message:", body["message"])
      #
      return

    #
    # success, extract userid:
    #
    body = res.json()

    user_id = body["user_id"]
    message = body["message"]

    #print(message)

    print(f"User {user_id} successfully {message}")

  except Exception as e:
    logging.error("add_user() failed:")
    logging.error("url: " + url)
    logging.error(e)
    return

###################################################################
#
# generate response
#
def generate_response(baseurl):
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
        print("Paste email content> ")
        email_text = input()
        print("Choose tone (formal, casual, apologetic, etc.)> ")
        tone = input().strip().lower()

        data = {"content": email_text, "tone": tone}

        # calling webservice
        api = '/generate'
        url = baseurl + api

        res = web_service_post(url, data)

        if res.status_code != 200:
            # failed:
            print("Failed with status code:", res.status_code)
            print("url: " + url)
            return
        
        body = res.json()

        response = body['reply']

        if response:
            print("**AI Generated Response**")
            print(response)
        else:
            print("**ERROR**")
            print("Failed to generate response :(")

        return response

        # client = openai.OpenAI(api_key=API_KEY)
        # response = client.chat.completions.create(
        #     model="gpt-4o-mini",
        #     messages=[
        #         {"role": "system", "content": f"You're an AI email assistant. Respond to this email in a {tone} tone."},
        #         {"role": "user", "content": email}
        #     ]
        # )
        
        # get response text
        #return response.choices[0]["message"]["content"]

    except Exception as e:
        print("Error:", e)
        return None
    
###################################################################
#
# get history
#
def history(baseurl):
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
        print("**Fetching email history**")

        # calling webservice
        api = '/history'
        url = baseurl + api

        res = web_service_get(url)

        if res.status_code != 200:
            # failed:
            print("Failed with status code:", res.status_code)
            print("url: " + url)
            return
        
        body = res.json()

        response = body['history']
        return response

    except Exception as e:
        print("Error:", e)
        return None

def main():
    print("AI Email Responder")

    configur = ConfigParser()
    configur.read('emailresponder-client-config.ini')
    baseurl = configur.get('client', 'webservice')

    cmd = prompt()

    while cmd != 0:
        if cmd == 1:
            generate_response(baseurl)
        elif cmd == 2:
            history(baseurl)
        elif cmd == 3:
           add_user(baseurl)
        else:
            print("** Unknown command, try again...")
        #
        cmd = prompt()

    #
    # done
    #
    print()
    print('** done **')

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