/* =========================================================================
   MALL AFTER DARK · game content
   -------------------------------------------------------------------------
   Each room has 7 question tickets. Exactly 4 are WH questions.
   The 4 numbers on the WH tickets, in card order, are the room code.
   The other 3 tickets (Yes/No questions) have decoy numbers.

   To edit a room: change the questions/numbers, then update `code` so it
   matches the four WH numbers in order. There are no Spanish translations.
   ========================================================================= */

const ESCAPE_DATA = {
  rooms: [
    /* --------------------------------------------------------------------
       ROOM 1 · CINEMA
       -------------------------------------------------------------------- */
    {
      id: "cinema",
      number: "01",
      icon: "🎬",
      accent: "#b79cff",
      title: "The Projection Room",
      topic: "Movies",
      intro: "The film stopped and the projectionist locked the door. Seven movie tickets are on the floor. The door code is the seat numbers on the WH-question tickets — in order.",
      hint: "WH questions start with What, Where, When, Who, Why, How, How much, How many or Which. Questions with Do, Does, Is, Are or Can are Yes/No questions.",
      code: "4726",
      cards: [
        { q: "Do you like comedies?", n: "9", wh: false },
        { q: "Where do you watch movies?", n: "4", wh: true },
        { q: "When does the movie start?", n: "7", wh: true },
        { q: "Is the movie in English?", n: "5", wh: false },
        { q: "Who is your favorite actor?", n: "2", wh: true },
        { q: "Can you buy popcorn here?", n: "1", wh: false },
        { q: "How much is a ticket?", n: "6", wh: true }
      ],
      mission: {
        title: "Team mission · Speak!",
        intro: "Before you leave the projection room, talk as a team in English.",
        tasks: [
          "Ask each teammate: “What is your favorite movie? Why?” Everyone answers in English.",
          "Report one answer to the group: “___'s favorite movie is ___ because ___.”"
        ]
      }
    },

    /* --------------------------------------------------------------------
       ROOM 2 · MUSIC STORE
       -------------------------------------------------------------------- */
    {
      id: "music",
      number: "02",
      icon: "🎵",
      accent: "#59c2ff",
      title: "The Music Store",
      topic: "Music",
      intro: "The music store is closed and the shutters are down. Seven playlist cards are on the counter. The door code is the track numbers on the WH-question cards — in order.",
      hint: "Look at the first word of each question. Do, Does, Is, Are and Can make Yes/No questions. They are not WH questions.",
      code: "8539",
      cards: [
        { q: "What kind of music do you like?", n: "8", wh: true },
        { q: "Can you play the guitar?", n: "2", wh: false },
        { q: "Are you a good singer?", n: "6", wh: false },
        { q: "Who is your favorite singer?", n: "5", wh: true },
        { q: "When do you listen to music?", n: "3", wh: true },
        { q: "Do you sing in the shower?", n: "1", wh: false },
        { q: "How do you listen to music?", n: "9", wh: true }
      ],
      mission: {
        title: "Team mission · Speak!",
        intro: "Before you leave the music store, talk about music.",
        tasks: [
          "Ask two teammates: “Who is your favorite singer?” and “When do you listen to music?”",
          "Invent one new question with Where and ask the group."
        ]
      }
    },

    /* --------------------------------------------------------------------
       ROOM 3 · BANK
       -------------------------------------------------------------------- */
    {
      id: "bank",
      number: "03",
      icon: "🏦",
      accent: "#3ddc97",
      title: "The Bank Vault",
      topic: "Bank & money",
      intro: "The bank vault is locked. Seven receipts are on the desk. The vault code is the receipt numbers on the WH-question receipts — in order.",
      hint: "A WH question asks for information: a place, a time, a person, a reason, a thing or a quantity. A Yes/No question asks for a yes or no answer.",
      code: "6472",
      cards: [
        { q: "Do you have a credit card?", n: "3", wh: false },
        { q: "Where is the nearest bank?", n: "6", wh: true },
        { q: "Is there an ATM near here?", n: "8", wh: false },
        { q: "When does the bank open?", n: "4", wh: true },
        { q: "Can I pay with my phone?", n: "5", wh: false },
        { q: "How much money do you need?", n: "7", wh: true },
        { q: "Who works at the bank?", n: "2", wh: true }
      ],
      mission: {
        title: "Team mission · Role-play",
        intro: "Before you leave the vault, act out a conversation at the bank.",
        tasks: [
          "Student A is the bank clerk, Student B is the customer. Ask and answer three questions from the receipts.",
          "Swap roles. Use: “Can I pay with my phone?” and “How much is it?”"
        ]
      }
    },

    /* --------------------------------------------------------------------
       ROOM 4 · FOOD COURT
       -------------------------------------------------------------------- */
    {
      id: "food",
      number: "04",
      icon: "🍕",
      accent: "#ffc857",
      title: "The Food Court",
      topic: "Food & drinks",
      intro: "The food court is closing and the kitchen door is locked. Seven order tickets are on the table. The code is the order numbers on the WH-question tickets — in order.",
      hint: "How much and How many are WH questions too! They ask about price and quantity. Check the first word carefully.",
      code: "9345",
      cards: [
        { q: "What do you eat for breakfast?", n: "9", wh: true },
        { q: "How many eggs do you need?", n: "3", wh: true },
        { q: "Is the soup hot?", n: "1", wh: false },
        { q: "Do you want a glass of water?", n: "7", wh: false },
        { q: "Why don't you eat meat?", n: "4", wh: true },
        { q: "Which drink is cold?", n: "5", wh: true },
        { q: "Are you ready to order?", n: "2", wh: false }
      ],
      mission: {
        title: "Team mission · Order food",
        intro: "Before you leave the food court, order a meal in English.",
        tasks: [
          "One student is the waiter, two are customers. Order food and drinks in English.",
          "Use at least one question with What, one with How much and one with Do."
        ]
      }
    }
  ]
};
