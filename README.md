# Visualize changes in class schedules from Zermelo

With the growing call to ban phones from schools an ancient, almost forgotten concept is on the rise again: a method 
to view today's changes on a screen. This project aims to provide a simple, secure and free way to show relevant 
information on screens. 

Rowizer: 
- Shows only relevant information[^1] - no endless lists of changes. 
- Highlights new changes (made after 8AM)

[^1]:  Cluster changes are currently always shown, in the future only relevant changes will appear.

![Screenshot of a live Rowizer example](/assets/img/example.png)

## Try a demo
[Try a live demo!](https://vlietland-college.github.io/Rowizer?token=ql605d4r5pbb7lffhprln7hcon&portal=j9qeq&date=19-6-2024&branch=a). The data is fetched from my development portal. 

## How to use?
So, you're an BIP or ASP and would like to try Rowizer? It will only take a minute and is completely free! And, since the application runs 100% in-browser, no data is sent to any servers (well, except Zermelo, but we trust them) so no need for any signatures!

### Get an API-token
[Zermelo has written a nice how-to](https://support.zermelo.nl/guides/applicatiebeheerder/koppelingen/overige-koppelingen-2/koppeling-met-overige-externe-partijen#stap_1_gebruiker_toevoegen)! 

### URL Parameters for testing
All settings are done by using URL-parameters. Only two (or three, if your school has multiple branches) are really needed to start: the token and the portal id (the part before .zportal.nl)
```
https://vlietland-college.github.io/Rowizer?token={API_TOKEN_HERE}&portal={PORTAL_NAME_HERE}
```
If you have multiple branches, add:
```
&branch={BRANCH_CODE_HERE}
```
Rowizer will automatically show today. If you want to try another day, use the date parameter with DD-MM-YYYY format:
```
&date=19-6-2024
```

### Use in production
You are very welcome to use Rowizer using our Github-pages. Bear in mind that things can change at any moment - we are not responsible for any breaking changes. We recommend creating your own fork and using Github pages. 
