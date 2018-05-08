import FirebaseCredentials
import twilioAuth
from firebase_admin import db

#run, the program that stores the function

#gets Firebase data of labs
def getLabs():
    ref = db.reference('labs')
    return ref.get()

#gets Firebase data of phone numbers
def getPhoneNumbers():
    ref = db.reference('phoneNumbers')
    return ref.get()

#main function to run on python background tasks
def run_scanFirebase():
    #code here
    print('hello')
    labData = getLabs()
    phoneData = getPhoneNumbers()

    # phoneNumbers Firebase reference
    phoneNumbers = db.reference('phoneNumbers')

    #main for loop that goes through each value in the phone numbers class
    for labName, data in phoneData.items():
        if (data[0] != ''):
            print(labName)

            #for loop for each number number in the particular lab
            for number in data:
                print(number)

                #create final phone number
                finalNumber = str(number)

                #number of people in lab
                numOfPeople = labData[labName]['people']

                #if statement to only send message that there is room if 4 or less people are in it
                if (numOfPeople <= 4):
                    if (numOfPeople == 1):
                        message = str(labName) + " has " + str(
                            numOfPeople) + " person, there is plenty of room for you to work here!!"
                        print(message)
                    else:
                        message = str(labName) + " has " + str(
                            numOfPeople) + " people, there is plenty of room for you to work here!!"
                        print(message)
                    twilioAuth.client.api.account.messages.create(
                        to=finalNumber,
                        from_="+18317039681",
                        body=message)

                    # data from firebase
                    editPhoneData = getPhoneNumbers()

                    # specific lab data
                    editArrayNum = editPhoneData[labName]

                    # removes phone number fromo list
                    editArrayNum.remove(finalNumber)
                    #editArrayNum = [x for x in editArrayNum if x != number]

                    # updates data in firebase
                    if (len(editArrayNum) == 0):
                        phoneNumbers.update({
                            labName: {
                                '0': ""
                            }
                        })
                    else:
                        phoneNumbers.update({
                            labName: editArrayNum
                        })
            #print(numOfPeople)
            #print(data)

