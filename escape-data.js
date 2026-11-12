/* =========================================================================
   MALL AFTER DARK · game content
   -------------------------------------------------------------------------
   Each room has 8 question tickets. Exactly 5 are WH questions.
   The 5 numbers on the WH tickets, in card order, are the room code.
   The other 3 tickets (Yes/No questions) have decoy numbers.

   To edit a room: change the questions/numbers, then update `code` so it
   matches the five WH numbers in order. There are no Spanish translations.
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
      intro: "The film stopped and the projectionist locked the door. Eight movie tickets are on the floor. The door code is the seat numbers on the five WH-question tickets — in order.",
      hint: "WH questions start with What, Where, When, Who, Why, How, How much, How many or Which. Questions with Do, Does, Is, Are or Can are Yes/No questions.",
      code: "47326",
      cards: [
        { q: "Do you like comedies?", n: "9", wh: false },
        { q: "Where do you watch movies?", n: "4", wh: true },
        { q: "When does the movie start?", n: "7", wh: true },
        { q: "Why do you like comedies?", n: "3", wh: true },
        { q: "Is the movie in English?", n: "5", wh: false },
        { q: "Who is your favorite actor?", n: "2", wh: true },
        { q: "Can you buy popcorn here?", n: "1", wh: false },
        { q: "How much is a ticket?", n: "6", wh: true }
      ],
      mission: {
        title: "Team mission · Question chain",
        intro: "Each member asks one movie question to the next member. Answer in English, then pass the turn."
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
      intro: "The music store is closed and the shutters are down. Eight playlist cards are on the counter. The door code is the track numbers on the five WH-question cards — in order.",
      hint: "Look at the first word of each question. Do, Does, Is, Are and Can make Yes/No questions. They are not WH questions.",
      code: "84539",
      cards: [
        { q: "What kind of music do you like?", n: "8", wh: true },
        { q: "Where do you listen to music?", n: "4", wh: true },
        { q: "Can you play the guitar?", n: "2", wh: false },
        { q: "Are you a good singer?", n: "6", wh: false },
        { q: "Who is your favorite singer?", n: "5", wh: true },
        { q: "When do you listen to music?", n: "3", wh: true },
        { q: "Do you sing in the shower?", n: "1", wh: false },
        { q: "How do you listen to music?", n: "9", wh: true }
      ],
      mission: {
        title: "Team mission · Question chain",
        intro: "Each member asks one music question to the next member. Answer in English, then pass the turn."
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
      intro: "The bank vault is locked. Eight receipts are on the desk. The vault code is the receipt numbers on the five WH-question receipts — in order.",
      hint: "A WH question asks for information: a place, a time, a person, a reason, a thing or a quantity. A Yes/No question asks for a yes or no answer.",
      code: "69472",
      cards: [
        { q: "Do you have a credit card?", n: "3", wh: false },
        { q: "Where is the nearest bank?", n: "6", wh: true },
        { q: "Why do you need the money?", n: "9", wh: true },
        { q: "Is there an ATM near here?", n: "8", wh: false },
        { q: "When does the bank open?", n: "4", wh: true },
        { q: "Can I pay with my phone?", n: "5", wh: false },
        { q: "How much money do you need?", n: "7", wh: true },
        { q: "Who works at the bank?", n: "2", wh: true }
      ],
      mission: {
        title: "Team mission · Question chain",
        intro: "Each member asks one bank question to the next member. Answer in English, then pass the turn."
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
      intro: "The food court is closing and the kitchen door is locked. Eight order tickets are on the table. The code is the order numbers on the five WH-question tickets — in order.",
      hint: "How much and How many are WH questions too! They ask about price and quantity. Check the first word carefully.",
      code: "93845",
      cards: [
        { q: "What do you eat for breakfast?", n: "9", wh: true },
        { q: "How many eggs do you need?", n: "3", wh: true },
        { q: "Is the soup hot?", n: "1", wh: false },
        { q: "Who cooks dinner at home?", n: "8", wh: true },
        { q: "Do you want a glass of water?", n: "7", wh: false },
        { q: "Why don't you eat meat?", n: "4", wh: true },
        { q: "Which drink is cold?", n: "5", wh: true },
        { q: "Are you ready to order?", n: "2", wh: false }
      ],
      mission: {
        title: "Team mission · Question chain",
        intro: "Each member asks one food question to the next member. Answer in English, then pass the turn."
      }
    }
  ]
};
