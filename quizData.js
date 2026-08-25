/**
 * quizData.js — 100+ Anime Quiz Questions
 * Types: character, power, plot, compare
 */

export const QUIZ_DATA = [
  // NARUTO
  { anime: 'Naruto', bg: 'https://wallpapercave.com/wp/wp2636582.jpg', q: 'Who is the strongest Hokage of all time?', options: ['Minato', 'Hashirama', 'Naruto', 'Tobirama'], answer: 'Hashirama', type: 'power' },
  { anime: 'Naruto', bg: 'https://wallpapercave.com/wp/wp2636582.jpg', q: "Which jutsu is Naruto's signature move?", options: ['Chidori', 'Rasengan', 'Amaterasu', 'Susanoo'], answer: 'Rasengan', type: 'character' },
  { anime: 'Naruto', bg: 'https://wallpapercave.com/wp/wp2636582.jpg', q: 'Who killed Itachi Uchiha?', options: ['Naruto', 'Kakashi', 'Sasuke', 'Obito'], answer: 'Sasuke', type: 'plot' },
  { anime: 'Naruto', bg: 'https://wallpapercave.com/wp/wp2636582.jpg', q: 'Who is stronger — Naruto or Sasuke?', options: ['Naruto', 'Sasuke', 'Equal', 'Depends on form'], answer: 'Equal', type: 'compare' },
  { anime: 'Naruto', bg: 'https://wallpapercave.com/wp/wp2636582.jpg', q: "What is the name of Naruto's father?", options: ['Jiraiya', 'Minato', 'Kakashi', 'Hiruzen'], answer: 'Minato', type: 'character' },
  { anime: 'Naruto', bg: 'https://wallpapercave.com/wp/wp2636582.jpg', q: 'Who is the most overpowered villain in Naruto?', options: ['Pain', 'Madara', 'Kaguya', 'Obito'], answer: 'Kaguya', type: 'power' },

  // ONE PIECE
  { anime: 'One Piece', bg: 'https://wallpapercave.com/wp/wp7476000.jpg', q: 'Who has the highest bounty in One Piece history?', options: ['Luffy', 'Whitebeard', 'Roger', 'Kaido'], answer: 'Roger', type: 'power' },
  { anime: 'One Piece', bg: 'https://wallpapercave.com/wp/wp7476000.jpg', q: 'What fruit did Monkey D. Luffy eat?', options: ['Mera Mera', 'Gum Gum', 'Op Op', 'Flame Flame'], answer: 'Gum Gum', type: 'character' },
  { anime: 'One Piece', bg: 'https://wallpapercave.com/wp/wp7476000.jpg', q: 'Zoro vs Mihawk — who wins currently?', options: ['Zoro', 'Mihawk', 'Equal', 'Neither'], answer: 'Mihawk', type: 'compare' },
  { anime: 'One Piece', bg: 'https://wallpapercave.com/wp/wp7476000.jpg', q: 'What is the most overpowered Devil Fruit?', options: ['Gum Gum', 'Op Op', 'Yami Yami', 'Quake Quake'], answer: 'Op Op', type: 'power' },
  { anime: 'One Piece', bg: 'https://wallpapercave.com/wp/wp7476000.jpg', q: 'Who destroyed Marineford?', options: ['Luffy', 'Whitebeard', 'Akainu', 'Blackbeard'], answer: 'Whitebeard', type: 'plot' },

  // ATTACK ON TITAN
  { anime: 'Attack on Titan', bg: 'https://wallpapercave.com/wp/wp4676351.jpg', q: 'Who has the most titan powers combined?', options: ['Eren', 'Zeke', 'Reiner', 'Annie'], answer: 'Eren', type: 'power' },
  { anime: 'Attack on Titan', bg: 'https://wallpapercave.com/wp/wp4676351.jpg', q: 'What is the final titan Eren awakens?', options: ['Attack Titan', 'War Hammer', 'Founding Titan', 'Beast Titan'], answer: 'Founding Titan', type: 'character' },
  { anime: 'Attack on Titan', bg: 'https://wallpapercave.com/wp/wp4676351.jpg', q: 'Who killed Commander Erwin?', options: ['Zeke', 'The Beast Titan', 'Reiner', 'No one, he died naturally'], answer: 'The Beast Titan', type: 'plot' },
  { anime: 'Attack on Titan', bg: 'https://wallpapercave.com/wp/wp4676351.jpg', q: 'Eren vs Levi — who would win at their peak?', options: ['Eren', 'Levi', 'Equal', 'Depends on titan form'], answer: 'Eren', type: 'compare' },

  // DRAGON BALL Z
  { anime: 'Dragon Ball Z', bg: 'https://wallpapercave.com/wp/wp1808859.jpg', q: 'Who is the most powerful Saiyan ever born?', options: ['Goku', 'Vegeta', 'Broly', 'Gohan'], answer: 'Broly', type: 'power' },
  { anime: 'Dragon Ball Z', bg: 'https://wallpapercave.com/wp/wp1808859.jpg', q: 'What transformation is beyond Super Saiyan Blue?', options: ['Ultra Instinct', 'SSB Evolution', 'SSG', 'Legendary SSJ'], answer: 'Ultra Instinct', type: 'character' },
  { anime: 'Dragon Ball Z', bg: 'https://wallpapercave.com/wp/wp1808859.jpg', q: 'Goku vs Vegeta — who wins overall in Dragon Ball Super?', options: ['Goku', 'Vegeta', 'Equal', 'Beerus decides'], answer: 'Goku', type: 'compare' },
  { anime: 'Dragon Ball Z', bg: 'https://wallpapercave.com/wp/wp1808859.jpg', q: 'Who killed Frieza in the original Dragon Ball Z?', options: ['Goku', 'Gohan', 'Future Trunks', 'Vegeta'], answer: 'Future Trunks', type: 'plot' },

  // DEMON SLAYER
  { anime: 'Demon Slayer', bg: 'https://wallpapercave.com/wp/wp7549063.jpg', q: 'Who is the strongest Hashira in Demon Slayer?', options: ['Rengoku', 'Gyomei', 'Sanemi', 'Giyu'], answer: 'Gyomei', type: 'power' },
  { anime: 'Demon Slayer', bg: 'https://wallpapercave.com/wp/wp7549063.jpg', q: 'What breathing style does Tanjiro primarily use?', options: ['Water', 'Thunder', 'Sun', 'Flame'], answer: 'Water', type: 'character' },
  { anime: 'Demon Slayer', bg: 'https://wallpapercave.com/wp/wp7549063.jpg', q: 'Who is the main villain of Demon Slayer?', options: ['Akaza', 'Doma', 'Muzan', 'Kokushibo'], answer: 'Muzan', type: 'plot' },
  { anime: 'Demon Slayer', bg: 'https://wallpapercave.com/wp/wp7549063.jpg', q: 'Tanjiro vs Zenitsu — who is stronger?', options: ['Tanjiro', 'Zenitsu', 'Equal', 'Inosuke is stronger'], answer: 'Tanjiro', type: 'compare' },

  // MY HERO ACADEMIA
  { anime: 'My Hero Academia', bg: 'https://wallpapercave.com/wp/wp3924093.jpg', q: 'Who is the Number 1 Hero in My Hero Academia?', options: ['All Might', 'Endeavor', 'Hawks', 'Best Jeanist'], answer: 'Endeavor', type: 'character' },
  { anime: 'My Hero Academia', bg: 'https://wallpapercave.com/wp/wp3924093.jpg', q: 'What quirk does Izuku Midoriya inherit?', options: ['All For One', 'One For All', 'Explosion', 'Half Cold Half Hot'], answer: 'One For All', type: 'character' },
  { anime: 'My Hero Academia', bg: 'https://wallpapercave.com/wp/wp3924093.jpg', q: 'Who is stronger — Deku or Bakugo at the end?', options: ['Deku', 'Bakugo', 'Equal', 'Shoto is stronger'], answer: 'Deku', type: 'compare' },
  { anime: 'My Hero Academia', bg: 'https://wallpapercave.com/wp/wp3924093.jpg', q: 'Who is the most overpowered villain?', options: ['Shigaraki', 'All For One', 'Overhaul', 'Stain'], answer: 'All For One', type: 'power' },

  // FULLMETAL ALCHEMIST
  { anime: 'Fullmetal Alchemist', bg: 'https://wallpapercave.com/wp/wp2028203.jpg', q: 'What is the most powerful form of alchemy?', options: ['Fire alchemy', 'Philosopher Stone', 'Human transmutation', 'Truth alchemy'], answer: 'Philosopher Stone', type: 'power' },
  { anime: 'Fullmetal Alchemist', bg: 'https://wallpapercave.com/wp/wp2028203.jpg', q: 'Edward vs Alphonse — who is stronger?', options: ['Edward', 'Alphonse', 'Equal', 'Neither'], answer: 'Edward', type: 'compare' },

  // HUNTER X HUNTER
  { anime: 'Hunter x Hunter', bg: 'https://wallpapercave.com/wp/wp2754307.jpg', q: 'Who is the strongest character in HxH?', options: ['Gon', 'Killua', 'Meruem', 'Netero'], answer: 'Meruem', type: 'power' },
  { anime: 'Hunter x Hunter', bg: 'https://wallpapercave.com/wp/wp2754307.jpg', q: 'What Nen type does Killua use?', options: ['Enhancer', 'Transmuter', 'Emitter', 'Manipulator'], answer: 'Transmuter', type: 'character' },
  { anime: 'Hunter x Hunter', bg: 'https://wallpapercave.com/wp/wp2754307.jpg', q: 'Gon vs Killua — who is stronger at their best?', options: ['Gon', 'Killua', 'Equal', 'Meruem beats both'], answer: 'Gon', type: 'compare' },

  // JUJUTSU KAISEN
  { anime: 'Jujutsu Kaisen', bg: 'https://wallpapercave.com/wp/wp10079411.jpg', q: 'Who is the King of Curses in JJK?', options: ['Gojo', 'Yuji', 'Sukuna', 'Mahito'], answer: 'Sukuna', type: 'power' },
  { anime: 'Jujutsu Kaisen', bg: 'https://wallpapercave.com/wp/wp10079411.jpg', q: "What is Gojo Satoru's strongest technique?", options: ['Divergent Fist', 'Hollow Purple', 'Black Flash', 'Cursed Energy'], answer: 'Hollow Purple', type: 'character' },
  { anime: 'Jujutsu Kaisen', bg: 'https://wallpapercave.com/wp/wp10079411.jpg', q: 'Gojo vs Sukuna — who is stronger?', options: ['Gojo', 'Sukuna', 'Equal', 'Depends on seals'], answer: 'Sukuna', type: 'compare' },
  { anime: 'Jujutsu Kaisen', bg: 'https://wallpapercave.com/wp/wp10079411.jpg', q: 'Who killed Gojo Satoru?', options: ['Sukuna', 'Kenjaku', 'Yuta', 'Mahoraga'], answer: 'Sukuna', type: 'plot' },

  // BLEACH
  { anime: 'Bleach', bg: 'https://wallpapercave.com/wp/wp1808481.jpg', q: 'Who is the most powerful Soul Reaper?', options: ['Ichigo', 'Yamamoto', 'Aizen', 'Yhwach'], answer: 'Yhwach', type: 'power' },
  { anime: 'Bleach', bg: 'https://wallpapercave.com/wp/wp1808481.jpg', q: "What is Ichigo's final form called?", options: ['Bankai', 'True Shikai', 'Final Getsuga', 'True Bankai'], answer: 'True Bankai', type: 'character' },
  { anime: 'Bleach', bg: 'https://wallpapercave.com/wp/wp1808481.jpg', q: 'Aizen vs Yhwach — who is more powerful?', options: ['Aizen', 'Yhwach', 'Equal', 'Soul King is stronger'], answer: 'Yhwach', type: 'compare' },

  // TOKYO GHOUL
  { anime: 'Tokyo Ghoul', bg: 'https://wallpapercave.com/wp/wp1805642.jpg', q: 'Who is the One-Eyed King in Tokyo Ghoul?', options: ['Arima', 'Kaneki', 'Eto', 'Yoshimura'], answer: 'Kaneki', type: 'plot' },
  { anime: 'Tokyo Ghoul', bg: 'https://wallpapercave.com/wp/wp1805642.jpg', q: 'What is the strongest kagune type?', options: ['Rinkaku', 'Ukaku', 'Bikaku', 'Koukaku'], answer: 'Rinkaku', type: 'power' },

  // BLACK CLOVER
  { anime: 'Black Clover', bg: 'https://wallpapercave.com/wp/wp6209564.jpg', q: 'What power does Asta have instead of magic?', options: ['Anti-magic', 'Dark magic', 'Demon magic', 'Null magic'], answer: 'Anti-magic', type: 'power' },
  { anime: 'Black Clover', bg: 'https://wallpapercave.com/wp/wp6209564.jpg', q: 'Asta vs Yuno — who is stronger in the end?', options: ['Asta', 'Yuno', 'Equal', 'Yuno by far'], answer: 'Equal', type: 'compare' },

  // DEATH NOTE
  { anime: 'Death Note', bg: 'https://wallpapercave.com/wp/wp1808465.jpg', q: 'Who is smarter — Light Yagami or L?', options: ['Light', 'L', 'Equal', 'Near is smarter'], answer: 'Equal', type: 'compare' },
  { anime: 'Death Note', bg: 'https://wallpapercave.com/wp/wp1808465.jpg', q: 'How does Light Yagami die?', options: ['L kills him', 'Near exposes him', 'Ryuk writes his name', 'Matsuda shoots him'], answer: 'Ryuk writes his name', type: 'plot' },
  { anime: 'Death Note', bg: 'https://wallpapercave.com/wp/wp1808465.jpg', q: "What is the name of Light's Shinigami?", options: ['Rem', 'Ryuk', 'Gelus', 'Sidoh'], answer: 'Ryuk', type: 'character' },

  // FAIRY TAIL
  { anime: 'Fairy Tail', bg: 'https://wallpapercave.com/wp/wp1947793.jpg', q: 'Who is the strongest member of Fairy Tail guild?', options: ['Natsu', 'Gildarts', 'Erza', 'Laxus'], answer: 'Gildarts', type: 'power' },
  { anime: 'Fairy Tail', bg: 'https://wallpapercave.com/wp/wp1947793.jpg', q: 'What dragon taught Natsu his magic?', options: ['Weisslogia', 'Metalicana', 'Igneel', 'Grandeeney'], answer: 'Igneel', type: 'character' },

  // CODE GEASS
  { anime: 'Code Geass', bg: 'https://wallpapercave.com/wp/wp1844508.jpg', q: "What is Lelouch's Geass power?", options: ['Mind control', 'Future sight', 'Absolute obedience', 'Memory erase'], answer: 'Absolute obedience', type: 'character' },
  { anime: 'Code Geass', bg: 'https://wallpapercave.com/wp/wp1844508.jpg', q: 'Lelouch vs Light Yagami — who outsmarts whom?', options: ['Lelouch', 'Light', 'Equal', 'Depends on rules'], answer: 'Equal', type: 'compare' },

  // ONE PUNCH MAN
  { anime: 'One Punch Man', bg: 'https://wallpapercave.com/wp/wp1816436.jpg', q: 'Why can Saitama defeat anyone in one punch?', options: ['God gave him power', 'He trained too hard', 'He is a god', 'Unknown'], answer: 'He trained too hard', type: 'power' },
  { anime: 'One Punch Man', bg: 'https://wallpapercave.com/wp/wp1816436.jpg', q: 'Saitama vs Goku — who wins?', options: ['Saitama', 'Goku', 'One punch wins', 'Goku outscales'], answer: 'Saitama', type: 'compare' },
  { anime: 'One Punch Man', bg: 'https://wallpapercave.com/wp/wp1816436.jpg', q: 'Who is the highest ranked S-Class hero?', options: ['Tatsumaki', 'Blast', 'Metal Knight', 'Atomic Samurai'], answer: 'Blast', type: 'character' },

  // MOB PSYCHO 100
  { anime: 'Mob Psycho 100', bg: 'https://wallpapercave.com/wp/wp4248825.jpg', q: 'Who is stronger — Mob or Tatsumaki from OPM?', options: ['Mob', 'Tatsumaki', 'Equal', 'Depends on 100%'], answer: 'Equal', type: 'compare' },
  { anime: 'Mob Psycho 100', bg: 'https://wallpapercave.com/wp/wp4248825.jpg', q: 'What happens when Mob reaches 100% emotion?', options: ['He sleeps', 'He loses control', 'He gets stronger', 'He disappears'], answer: 'He gets stronger', type: 'power' },

  // RE:ZERO
  { anime: 'Re:Zero', bg: 'https://wallpapercave.com/wp/wp1960892.jpg', q: "What is Subaru's special ability?", options: ['Magic', 'Return by Death', 'Time freeze', 'Foresight'], answer: 'Return by Death', type: 'character' },
  { anime: 'Re:Zero', bg: 'https://wallpapercave.com/wp/wp1960892.jpg', q: 'Who is the strongest Witch in Re:Zero?', options: ['Satella', 'Echidna', 'Sekhmet', 'Minerva'], answer: 'Satella', type: 'power' },

  // OVERLORD
  { anime: 'Overlord', bg: 'https://wallpapercave.com/wp/wp2028107.jpg', q: "What is Ainz Ooal Gown's most powerful spell?", options: ['Grasp Heart', 'Goal of All Life is Death', 'True Death', 'Tier Magic'], answer: 'Goal of All Life is Death', type: 'power' },
  { anime: 'Overlord', bg: 'https://wallpapercave.com/wp/wp2028107.jpg', q: 'Ainz vs Shalltear — who wins in a real fight?', options: ['Ainz', 'Shalltear', 'Equal', 'Depends on preparation'], answer: 'Ainz', type: 'compare' },

  // CHAINSAW MAN
  { anime: 'Chainsaw Man', bg: 'https://wallpapercave.com/wp/wp14062028.jpg', q: 'Who is the most feared devil in Chainsaw Man?', options: ['Pochita', 'Gun Devil', 'Darkness Devil', 'Control Devil'], answer: 'Darkness Devil', type: 'power' },
  { anime: 'Chainsaw Man', bg: 'https://wallpapercave.com/wp/wp14062028.jpg', q: 'What devil did Denji fuse with?', options: ['Gun Devil', 'Bat Devil', 'Chainsaw Devil', 'Blood Devil'], answer: 'Chainsaw Devil', type: 'character' },
  { anime: 'Chainsaw Man', bg: 'https://wallpapercave.com/wp/wp14062028.jpg', q: 'Denji vs Aki — who would win?', options: ['Denji', 'Aki', 'Equal', 'Power would beat both'], answer: 'Denji', type: 'compare' },

  // SPY X FAMILY
  { anime: 'Spy x Family', bg: 'https://wallpapercave.com/wp/wp13680792.jpg', q: "What is Anya's secret ability?", options: ['Telepathy', 'Mind control', 'Future sight', 'Invisibility'], answer: 'Telepathy', type: 'character' },
  { anime: 'Spy x Family', bg: 'https://wallpapercave.com/wp/wp13680792.jpg', q: "What is Loid Forger's spy codename?", options: ['Ghost', 'Twilight', 'Phantom', 'Shadow'], answer: 'Twilight', type: 'character' },

  // BLUE LOCK
  { anime: 'Blue Lock', bg: 'https://wallpapercave.com/wp/wp14280023.jpg', q: 'Who is the main protagonist of Blue Lock?', options: ['Bachira', 'Isagi', 'Kunigami', 'Chigiri'], answer: 'Isagi', type: 'character' },
  { anime: 'Blue Lock', bg: 'https://wallpapercave.com/wp/wp14280023.jpg', q: 'Who is the most overpowered player in Blue Lock?', options: ['Isagi', 'Rin', 'Shidou', 'Kaiser'], answer: 'Shidou', type: 'power' },

  // HAIKYUU
  { anime: 'Haikyuu', bg: 'https://wallpapercave.com/wp/wp4677313.jpg', q: 'Who is the greatest setter in Haikyuu?', options: ['Kageyama', 'Oikawa', 'Sugawara', 'Akaashi'], answer: 'Kageyama', type: 'power' },
  { anime: 'Haikyuu', bg: 'https://wallpapercave.com/wp/wp4677313.jpg', q: "What is Hinata's most unique ability?", options: ['Height', 'Jump', 'Speed', 'Reflexes'], answer: 'Jump', type: 'character' },

  // TOKYO REVENGERS
  { anime: 'Tokyo Revengers', bg: 'https://wallpapercave.com/wp/wp12009455.jpg', q: 'Who is the strongest fighter in Tokyo Revengers?', options: ['Mikey', 'Draken', 'Takemichi', 'Izana'], answer: 'Mikey', type: 'power' },
  { anime: 'Tokyo Revengers', bg: 'https://wallpapercave.com/wp/wp12009455.jpg', q: "What is Takemichi's special ability?", options: ['Super strength', 'Time leaping', 'Future sight', 'Memory control'], answer: 'Time leaping', type: 'character' },

  // GURREN LAGANN
  { anime: 'Gurren Lagann', bg: 'https://wallpapercave.com/wp/wp2028153.jpg', q: 'What is the most powerful mech in Gurren Lagann?', options: ['Gurren', 'Lazengann', 'Super Tengen Toppa', 'Lagann'], answer: 'Super Tengen Toppa', type: 'power' },
  { anime: 'Gurren Lagann', bg: 'https://wallpapercave.com/wp/wp2028153.jpg', q: "Who is Simon's most important mentor?", options: ['Kamina', 'Leeron', 'Lordgenome', 'Viral'], answer: 'Kamina', type: 'character' },

  // THAT TIME I GOT REINCARNATED AS A SLIME
  { anime: 'Tensei Slime', bg: 'https://wallpapercave.com/wp/wp4248884.jpg', q: "What is Rimuru's most broken ability?", options: ['Predator', 'Belzebuth', 'Gluttony', 'Great Sage'], answer: 'Belzebuth', type: 'power' },
  { anime: 'Tensei Slime', bg: 'https://wallpapercave.com/wp/wp4248884.jpg', q: 'Rimuru vs Ainz — who is stronger?', options: ['Rimuru', 'Ainz', 'Equal', 'Depends on preparation'], answer: 'Rimuru', type: 'compare' },

  // VINLAND SAGA
  { anime: 'Vinland Saga', bg: 'https://wallpapercave.com/wp/wp10083254.jpg', q: 'Who is the greatest warrior in Vinland Saga?', options: ['Thors', 'Thorfinn', 'Askeladd', 'Canute'], answer: 'Thors', type: 'power' },
  { anime: 'Vinland Saga', bg: 'https://wallpapercave.com/wp/wp10083254.jpg', q: 'Who killed Thors in Vinland Saga?', options: ['Thorfinn', 'Bjorn', 'Askeladd', 'Floki'], answer: 'Askeladd', type: 'plot' },

  // STEINS GATE
  { anime: 'Steins Gate', bg: 'https://wallpapercave.com/wp/wp1839897.jpg', q: 'What does Okabe use to send messages to the past?', options: ['Time machine', 'D-Mail', 'Phone microwave', 'Lab computer'], answer: 'D-Mail', type: 'plot' },

  // NO GAME NO LIFE
  { anime: 'No Game No Life', bg: 'https://wallpapercave.com/wp/wp1875698.jpg', q: 'What are Sora and Shiro known as together?', options: ['Blank', 'Kuuhaku', 'Gamer Gods', 'Both A and B'], answer: 'Both A and B', type: 'character' },
  { anime: 'No Game No Life', bg: 'https://wallpapercave.com/wp/wp1875698.jpg', q: 'How many losses does Blank have?', options: ['0', '1', '5', '10'], answer: '0', type: 'plot' },

  // KONOSUBA
  { anime: 'KonoSuba', bg: 'https://wallpapercave.com/wp/wp1960865.jpg', q: "What is Aqua's biggest weakness?", options: ['Fire magic', 'Undead can drain her', 'She has no weakness', 'She is too lazy'], answer: 'Undead can drain her', type: 'character' },
  { anime: 'KonoSuba', bg: 'https://wallpapercave.com/wp/wp1960865.jpg', q: 'Who is actually the strongest in the KonoSuba party?', options: ['Kazuma', 'Aqua', 'Megumin', 'Darkness'], answer: 'Aqua', type: 'power' },

  // SWORD ART ONLINE
  { anime: 'Sword Art Online', bg: 'https://wallpapercave.com/wp/wp1960930.jpg', q: "What is Kirito's most powerful skill in SAO?", options: ['Starburst Stream', 'Dual Blades', 'Eclipse', 'Star Splash'], answer: 'Starburst Stream', type: 'power' },
  { anime: 'Sword Art Online', bg: 'https://wallpapercave.com/wp/wp1960930.jpg', q: 'Kirito vs Asuna — who is stronger?', options: ['Kirito', 'Asuna', 'Equal', 'Both are overpowered'], answer: 'Kirito', type: 'compare' },

  // EVANGELION
  { anime: 'Evangelion', bg: 'https://wallpapercave.com/wp/wp1944030.jpg', q: 'Who pilots Unit 01 in Evangelion?', options: ['Rei', 'Asuka', 'Shinji', 'Kaworu'], answer: 'Shinji', type: 'character' },
  { anime: 'Evangelion', bg: 'https://wallpapercave.com/wp/wp1944030.jpg', q: 'What is the most powerful Eva Unit?', options: ['Unit 00', 'Unit 01', 'Unit 02', 'Mark.06'], answer: 'Unit 01', type: 'power' },

  // MUSHOKU TENSEI
  { anime: 'Mushoku Tensei', bg: 'https://wallpapercave.com/wp/wp12009423.jpg', q: 'Who is the most powerful mage in Mushoku Tensei?', options: ['Rudeus', 'Orsted', 'Perugius', 'Laplace'], answer: 'Laplace', type: 'power' },

  // CROSS ANIME BATTLES
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp7476000.jpg', q: 'Who would win — Naruto (Baryon Mode) vs Luffy (Gear 5)?', options: ['Naruto', 'Luffy', 'Equal', 'Saitama interrupts'], answer: 'Equal', type: 'compare' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp1808859.jpg', q: 'Who would win — Goku (MUI) vs Saitama?', options: ['Goku', 'Saitama', 'Equal', 'One punch ends it'], answer: 'Saitama', type: 'compare' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp10079411.jpg', q: 'Who is smarter — Lelouch or Light Yagami?', options: ['Lelouch', 'Light', 'Equal', 'L is smarter than both'], answer: 'Equal', type: 'compare' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp4676351.jpg', q: 'Who would win — Eren (Full Rumbling) vs Muzan?', options: ['Eren', 'Muzan', 'Equal', 'Depends on sunlight'], answer: 'Eren', type: 'compare' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp1816436.jpg', q: 'Most overpowered anime character of all time?', options: ['Saitama', 'Zeno', 'Rimuru', 'Ainz'], answer: 'Zeno', type: 'power' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp7549063.jpg', q: 'Who would win — Tanjiro vs Yuji Itadori?', options: ['Tanjiro', 'Yuji', 'Equal', 'Sukuna destroys both'], answer: 'Yuji', type: 'compare' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp2028203.jpg', q: 'Best written villain — Madara, Aizen or Meruem?', options: ['Madara', 'Aizen', 'Meruem', 'All equal'], answer: 'Meruem', type: 'compare' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp10079411.jpg', q: 'Strongest anime swordsman — Zoro, Ichigo or Gintoki?', options: ['Zoro', 'Ichigo', 'Gintoki', 'Mihawk'], answer: 'Ichigo', type: 'compare' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp1808859.jpg', q: 'Who has the most hax ability in all anime?', options: ['Zeno', 'Anti-Spiral', 'Haruhi', 'Featherine'], answer: 'Zeno', type: 'power' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp1816436.jpg', q: 'Strongest power system — Nen, Haki or Cursed Energy?', options: ['Nen', 'Haki', 'Cursed Energy', 'All equally broken'], answer: 'Nen', type: 'power' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp2028107.jpg', q: 'Who would win — Ainz vs Rimuru vs Diablo?', options: ['Ainz', 'Rimuru', 'Diablo', 'Rimuru after True Dragon'], answer: 'Rimuru after True Dragon', type: 'compare' },
  { anime: 'Anime Battle', bg: 'https://wallpapercave.com/wp/wp1808481.jpg', q: 'Best anime of all time — your vote?', options: ['Attack on Titan', 'One Piece', 'Naruto', 'Fullmetal Alchemist'], answer: 'Attack on Titan', type: 'compare' },
];

export function getRandomQuiz(postedIds = new Set()) {
  const unposted = QUIZ_DATA.map((q, i) => ({ q, i })).filter(({ i }) => !postedIds.has(i));
  if (unposted.length === 0) {
    const i = Math.floor(Math.random() * QUIZ_DATA.length);
    return { quiz: QUIZ_DATA[i], index: i, reset: true };
  }
  const shuffled = unposted.sort(() => Math.random() - 0.5);
  const { q: quiz, i: index } = shuffled[0];
  return { quiz, index, reset: false };
}
