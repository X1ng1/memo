# Memo

Our days go by in a blur and sometimes, we hardly recall what they were like as we follow the same daily routines. Diaries and journaling are a great way to keep track of our lives, but some people don’t want to fill up their spaces with endless journals. Our application offers an interactive, paperless method of keeping track of your life – a digital diary you can access at any time. 

**Wireframe:** [Figma](https://www.figma.com/design/TS3Ac1j1Hajc1lubS8tGZg/Memo-App?node-id=0-1&t=wZMSCLUVwWGBtOtK-1) <br/>
**Website Link:** https://memo-x1ng1.vercel.app/

## Key Features
1. **Visualization of Journal Data**
- The home page offers multiple visualizations of journaling history.
  - Left side features a mini calendar showing dates with existing entries and their corresponding emotions that day. 
  - Right side shows user's most recent journal entry.
<img width="512" height="258" alt="homepage" src="https://github.com/user-attachments/assets/bc756bdd-f2f3-4a40-b221-d4b5a865f420" />

2. **Interactive Calendar**
- The calendar page offers a bigger view of the calendar and existing entries. The user can click into any date with an existing journal entry and view its contents.
<img width="1383" height="836" alt="calendarpage" src="https://github.com/user-attachments/assets/06111968-d9ca-4b8b-950e-dc7ac688ec7b" />

3. **Journal Entry Creation**
- The user can input a title and content for their new entry. Upon submission, a machine learning model from HuggingFace, ([j-hartmann/emotion-english-distilroberta-base](https://huggingface.co/j-hartmann/emotion-english-distilroberta-base)), performs sentiment analysis on the entry's contents to determine the emotion that the user is feeling. 
<img width="962" height="813" alt="createentry" src="https://github.com/user-attachments/assets/e6d152f0-e0dd-4672-8834-8bddd4dde933" />

4. **View Entry**
- The user can view their existing entries. Each entry is display with its title, the date is was created on, its emotion, and the content. 
<img width="1040" height="651" alt="viewentry" src="https://github.com/user-attachments/assets/200ce253-679c-4b8f-98f6-5b3fd6806835" />

5. **Deocrate Entry**
- In the entry view, the user has the option to edit the journal entry, which is to choose stickers (PNG images) and drag them onto the journal entry to decorate it. These stickers are saved to entry data, so the user will see them in the same position every time they view the same journal entry.
<img width="1712" height="873" alt="editentry" src="https://github.com/user-attachments/assets/6770e895-b510-41aa-90b4-5cbd9f401df9" />

## Built With

[![React][React]][React-url]
[![Vite][Vite]][Vite-url]
[![Express.js][Express.js]][Express.js-url]
[![MongoDB][MongoDB]][MongoDB-url]
[![HuggingFace][HuggingFace]][HuggingFace-url]

[React]: https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB
[React-url]: https://react.dev/

[Vite]: https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff
[Vite-url]: https://vite.dev/

[Express.js]: https://img.shields.io/badge/Express.js-%23404d59.svg?logo=express&logoColor=%2361DAFB
[Express.js-url]: https://expressjs.com/

[MongoDB]: https://img.shields.io/badge/MongoDB-%234ea94b.svg?logo=mongodb&logoColor=white
[MongoDB-url]: https://www.mongodb.com/

[HuggingFace]: https://img.shields.io/badge/Hugging%20Face-FFD21E?logo=huggingface&logoColor=000
[HuggingFace-url]: https://huggingface.co/

## Team Members:
- Jessica Chen
- Nazifa Tabassum
