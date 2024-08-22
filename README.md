# Visualize changes in class schedules from Zermelo

With the growing call to ban phones from schools an ancient, almost forgotten concept is on the rise again: a method 
to view today's changes on a screen. This project aims to provide a simple, secure and free way to show relevant 
information on screens. 

Rowizer: 
- Determines the actual impact the changes have on the schedule: only relevant information[^1] is shown - no endless lists of changes. 
- Highlights new changes (made after 8AM)
- Always shows activities in green 
- Automatically fetches new changes from Zermelo



[^1]:  Cluster changes are currently always shown, in the future only relevant changes will appear. Eg: If entl4 with students X and Y is cancelled but biol1 (taken by student X) and ges2 (student Y) are moved to that period, the entl4 cancellation will not be shown - all students know where they have to go.

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

> [!WARNING]
> Rowizer is designed for (big) TV screens. The best result is achieved when using a 50 inch or lager 4K screen. 

### Use in production
You are very welcome to use Rowizer using our Github-pages. Bear in mind that things can change at any moment - we are not responsible for any breaking changes. We recommend creating your own fork and using Github pages. 


## URL Parameters
|Parameter| Example value              | required           | Description                                                                                                                                                                      |
|------|----------------------------|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|portal| j9qeq                      | x                  | The zportal ID (so the part before .zportal.nl                                                                                                                                   |
|token| nNuNiNdkgYYZoGDTiGuBIqOWyM | x                  | The API-token [generated](https://support.zermelo.nl/guides/applicatiebeheerder/koppelingen/overige-koppelingen-2/koppeling-met-overige-externe-partijen) in your Zermelo portal |
|branch| a                          | if multiple branches | The branch code (vestigingscode) found in Portal inrichting -> Vestigingen                                                                                                       |
|date| 22-03-2024                 | | To test Rowizer you can use a different date                                                                                                                                     |
|departmentsIgnore| kopkl,vavo                 ||Some departments should not be taken into consideration while determining if a whole education or yearOfEducation is present in an appointment.|
|mergeAppointments| false                      | | Before Zermelo 24.07 apoointments that span multiple periods were published as seperate appointments. (See [the release docs](https://support.zermelo.nl/news/posts/release-2407#wat_is_een_publicatieblokn)). If this parameter is omitted or set to anything but 'false', Rowizer automatically merges these appointments based on successive periods and identical teachers and groups.
