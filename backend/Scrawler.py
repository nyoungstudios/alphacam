from bs4 import BeautifulSoup
import requests
import FirebaseCredentials
from firebase_admin import db

def dataScrawler():
    #lab urls in list
    urls = ['https://www.cs.purdue.edu/resources/facilities/haasg40.html', 'https://www.cs.purdue.edu/resources/facilities/haasg56.html', 'https://www.cs.purdue.edu/resources/facilities/haas257.html', 'https://www.cs.purdue.edu/resources/facilities/lwsnb131.html', 'https://www.cs.purdue.edu/resources/facilities/lwsnb132a.html', 'https://www.cs.purdue.edu/resources/facilities/lwsnb146.html', 'https://www.cs.purdue.edu/resources/facilities/lwsnb148.html', 'https://www.cs.purdue.edu/resources/facilities/lwsnb158.html', 'https://www.cs.purdue.edu/resources/facilities/lwsnb160.html']

    #sets firebase reference
    ref = db.reference('/')
    labs_ref = ref.child('labs')

    for link in urls:
        data = requests.get(link).text
        soup = BeautifulSoup(data, "html.parser")

        #sets a number of default variable values
        count = 0
        cpu = ""
        model = ""
        monitor = 0
        name = link[link.find("facilities/") + len("facilities/"):link.find(".html")].upper()
        operatingSystem = ""
        ram = 0
        gfxCard = "none"
        printerName = "unknown"
        printerDescription = ""
        isLab = False

        labName_ref = labs_ref.child(name)

        print(name)

        #checks if it is special lab
        if (name == "LWSNB132A"):
            print("----------------")


        else:

            isLab = True

            for elem in soup.body.find_all("div", {"class":"maincontent col-lg-9 col-md-9 col-sm-9 col-xs-12 "}):
                #computer lab name
                print(elem.h1)
                #computer type
                strongLine = str(elem.strong)
                print(strongLine)

                #count and model of computer
                count = int(strongLine[8:strongLine.find(" ")])
                model = strongLine[strongLine.find(str(str(count) + " "))+len(str(str(count) + " ")):-9]

                #bullet points of specs of computer
                for li in elem.find_all("li"):
                    print(li)
                    if (str(li).__contains__("Intel")):
                        cpu = str(li)[4:-5]
                    elif (str(li).lower().__contains__("monitor")):

                        monitor = str(li)[4:str(li).find("-inch")]
                        if (monitor.__contains__("Dell")):
                            monitor = monitor[5:]
                        monitor = int(monitor)
                    elif (str(li).__contains__("operating system")):
                        operatingSystem = str(li)[4:-5]
                    elif (str(li).__contains__("RAM")):
                        ram = int(str(li)[4:str(li).find(" ")])
                    elif (str(li).__contains__("graphics")):
                        gfxCard = str(li)[4:-5]


                #finds printers for lab
                for p in elem.find_all("p"):
                    if (str(p).__contains__("print")):
                        print(p)
                        if (str(p).__contains__("<b>")):
                            printerName = str(p)[str(p).find("<b>") + len("<b>"):str(p).find("</b>")]
                        printerDescription = str(p)[str(p).find("This printer"):-4]

                print("----------------")

        #adds lab details to firebase
        labName_ref.update({
            'count': count,
            'cpu': cpu,
            'model': model,
            'monitor': monitor,
            'name': name,
            'os': operatingSystem,
            'ram': ram,
            'gpu': gfxCard,
            'printerName': printerName,
            'printerDescription': printerDescription,
            'isLab': isLab


        })




    print("We scrawled " + str(len(urls)) + " urls.")


def imgScrawler():
    #some variables
    urlBase = 'https://www.cs.purdue.edu/cams-delayed/'
    img = "none"

    #firebase reference
    ref = db.reference('labs/')
    data = ref.get()

    #loops through all of the data in firebase
    for labName, value in data.items():


        print(labName)
        #creates child of firebase reference
        labName_ref = ref.child(labName)

        #checks if it is a lab
        if (value.get("isLab")):
            if (not str(labName).__contains__("HAASG")):
                img = urlBase + str(labName) + ".jpg"
            else:
                img = urlBase + str(labName)[:5] + "0" + str(labName)[5:] + ".jpg"

            print(img)

        #adds image url to firebase
        labName_ref.update({
            'img': img
        })



    print("We have " + str(len(data)) + " labs.")



#dataScrawler()

imgScrawler()

