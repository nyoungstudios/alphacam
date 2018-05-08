from flask import Flask, request
import FirebaseCredentials
from firebase_admin import db
from flask_cors import CORS
import twilioAuth


app = Flask(__name__)
CORS(app)

@app.route("/")
def index():
    return "hello"

#gets Firebase data of labs
def getLabs():
    ref = db.reference('labs')
    return ref.get()

#gets Firebase data of phone numbers
def getPhoneNumbers():
    ref = db.reference('phoneNumbers')
    return ref.get()

#main api call
@app.route("/notify", methods=["GET"])
def notify():
    #stores data from labs
    labData = getLabs()
    #stores data from phone numbers
    phoneData = getPhoneNumbers()

    #phoneNumbers Firebase reference
    phoneNumbers = db.reference('phoneNumbers')

    #gets arguments lab and number
    lab = request.args.get('lab')
    number = request.args.get('number')

    #adds the +1 to the number since we only accept US numbers
    print(number)
    finalNumber = "+" + str(number)[1:]
    print(finalNumber)

    #gets the number of people in the requested lab
    numOfPeople = labData[lab]['people']

    newArrayNum = {}
    arrayNum = phoneData[lab]

    #flag
    flag = 0


    if (arrayNum[0] == ''):
        newArrayNum[0] = finalNumber
    else:
        for elem in arrayNum:
            if (elem == finalNumber):
                flag = 1
            newArrayNum[len(newArrayNum)] = elem
        newArrayNum[len(arrayNum)] = finalNumber

    if (flag):
        phoneNumbers.update({
            lab: arrayNum
        })
    else:
        phoneNumbers.update({
            lab : newArrayNum
        })

    #returns function if too many people (and the python background task function takes over from here
    if (numOfPeople > 4):
        print("too busy")
        return "too busy"
    else:
        #else, sends message that lab is open
        if (numOfPeople == 1):
            message = str(lab) + " has " + str(numOfPeople) + " person, there is plenty of room for you to work here!!"
            print(message)
        else:
            message = str(lab) + " has " + str(numOfPeople) + " people, there is plenty of room for you to work here!!"
            print(message)
        twilioAuth.client.api.account.messages.create(
            to=finalNumber,
            from_="+18317039681",
            body=message)


        # data from firebase
        editPhoneData = getPhoneNumbers()

        # specific lab data
        editArrayNum = editPhoneData[lab]

        # removes phone number fromo list
        editArrayNum.remove(finalNumber)
        #editArrayNum = [x for x in editArrayNum if x != number]

        #updates data in firebase
        if (len(editArrayNum) == 0):
            phoneNumbers.update({
                lab: {
                    '0': ""
                }
            })
        else:
            phoneNumbers.update({
                lab: editArrayNum
            })





    print("success")
    return "success"

#main starts here
if(__name__ == '__main__'):
    app.run(debug=True)