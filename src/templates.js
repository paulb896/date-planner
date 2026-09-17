/* ==========================================================================
   FlowCraft - Pre-built Interactive Flowchart Templates
   ========================================================================== */

export const TEMPLATES = {
  'bday-trip': {
    id: 'bday-trip',
    name: '🎂 Birthday Trip! (Handwritten Original)',
    description: 'The handwritten Birthday Trip flowchart complete with Uber decision, Ferry times, Smitty\'s/Tap Works, and Bike Rental return loop!',
    rootId: 'bday-home',
    nodes: [
      {
        id: 'bday-home',
        title: 'HOME',
        subtitle: 'Start of the Birthday Trip! 🚀',
        shape: 'pill',
        emoji: '🏠',
        color: '#ec4899',
        x: 340,
        y: 40,
        branches: [
          { id: 'bb-start', label: 'Start Trip 🚗', targetNodeId: 'bday-uber-q' }
        ]
      },
      {
        id: 'bday-uber-q',
        title: 'TAKE UBER?',
        subtitle: 'Fast ride vs. Public Transit',
        shape: 'diamond',
        emoji: '🚕',
        color: '#f59e0b',
        x: 340,
        y: 220,
        branches: [
          { id: 'bb-uber-yes', label: 'Yes (Uber $26) 🚗', targetNodeId: 'bday-uber-direct' },
          { id: 'bb-uber-no', label: 'No (Bus 222 ➔ 257) 🚌', targetNodeId: 'bday-bus-transit' }
        ]
      },
      {
        id: 'bday-uber-direct',
        title: 'Uber ($26)',
        subtitle: 'Direct ride to Horseshoe Bay Ferry Terminal',
        shape: 'rect',
        emoji: '🚗',
        color: '#3b82f6',
        x: 600,
        y: 440,
        branches: [
          { id: 'bb-u-ferry', label: 'Drive to Ferry Terminal 🚗', targetNodeId: 'bday-ferry' }
        ]
      },
      {
        id: 'bday-bus-transit',
        title: 'Bus 222 ➔ 257',
        subtitle: 'Express Bus to Horseshoe Bay',
        shape: 'rect',
        emoji: '🚌',
        color: '#06b6d4',
        x: 80,
        y: 440,
        branches: [
          { id: 'bb-b-ferry', label: 'Bus to Ferry Terminal 🚌', targetNodeId: 'bday-ferry' }
        ]
      },
      {
        id: 'bday-ferry',
        title: 'BOARD FERRY (HSB)',
        subtitle: 'Horseshoe Bay Ferry @ 9:05 AM (or 9:45 AM)',
        shape: 'rect',
        emoji: '⛴️',
        color: '#8b5cf6',
        x: 340,
        y: 660,
        branches: [
          { id: 'bb-to-bus1', label: 'Ferry Cruise across Bay ⛴️', targetNodeId: 'bday-bus-1' }
        ]
      },
      {
        id: 'bday-bus-1',
        title: 'Bus 1 @ 10:20 AM',
        subtitle: 'Scenic coastal bus ride into town',
        shape: 'rect',
        emoji: '🚌',
        color: '#3b82f6',
        x: 340,
        y: 880,
        branches: [
          { id: 'bb-to-food', label: 'Ride Bus 1 to Town 🚌', targetNodeId: 'bday-food-q' }
        ]
      },
      {
        id: 'bday-food-q',
        title: 'Food or Drinks First?',
        subtitle: 'Smitty\'s Diner or Tap Works Brewery?',
        shape: 'diamond',
        emoji: '🍽️',
        color: '#f59e0b',
        x: 340,
        y: 1100,
        branches: [
          { id: 'bb-smittys', label: 'Smitty\'s Diner 🥞', targetNodeId: 'bday-smittys' },
          { id: 'bb-tapworks', label: 'Tap Works Brewery 🍺', targetNodeId: 'bday-tapworks' }
        ]
      },
      {
        id: 'bday-smittys',
        title: 'Smitty\'s',
        subtitle: 'Hearty birthday diner breakfast & pancakes',
        shape: 'rect',
        emoji: '🥞',
        color: '#10b981',
        x: 120,
        y: 1320,
        branches: [
          { id: 'bb-s-bike', label: 'Walk to Bike Rental 🚲', targetNodeId: 'bday-bike-rental' }
        ]
      },
      {
        id: 'bday-tapworks',
        title: 'Tap Works',
        subtitle: 'Craft beers & patio celebratory drinks',
        shape: 'rect',
        emoji: '🍺',
        color: '#ec4899',
        x: 560,
        y: 1320,
        branches: [
          { id: 'bb-t-bike', label: 'Walk to Bike Rental 🚲', targetNodeId: 'bday-bike-rental' }
        ]
      },
      {
        id: 'bday-bike-rental',
        title: 'Bike Rental',
        subtitle: 'Pick up rental bicycles for coastal exploring',
        shape: 'rect',
        emoji: '🚲',
        color: '#06b6d4',
        x: 340,
        y: 1540,
        branches: [
          { id: 'bb-to-ride', label: 'Coastal Bike Ride 🚴', targetNodeId: 'bday-bike-ride' }
        ]
      },
      {
        id: 'bday-bike-ride',
        title: 'Bike Ride',
        subtitle: 'Sightseeing & coastal ride along the water',
        shape: 'rect',
        emoji: '🚴',
        color: '#10b981',
        x: -360,
        y: 1540,
        branches: [
          { id: 'bb-to-return-bike', label: 'Ride Bike to Station 🚴', targetNodeId: 'bday-return-bike' }
        ]
      },
      {
        id: 'bday-return-bike',
        title: 'Return Bike',
        subtitle: 'Drop off bikes at rental station',
        shape: 'rect',
        emoji: '🔑',
        color: '#8b5cf6',
        x: -360,
        y: 1320,
        branches: [
          { id: 'bb-to-return-bus', label: 'Catch Return Bus 🚌', targetNodeId: 'bday-return-bus' }
        ]
      },
      {
        id: 'bday-return-bus',
        title: 'Bus',
        subtitle: 'Bus back to Ferry Terminal',
        shape: 'rect',
        emoji: '🚌',
        color: '#3b82f6',
        x: -360,
        y: 1100,
        branches: [
          { id: 'bb-to-return-ferry', label: 'Bus to Ferry Terminal 🚌', targetNodeId: 'bday-return-ferry' }
        ]
      },
      {
        id: 'bday-return-ferry',
        title: 'Ferry',
        subtitle: 'Sunset ferry ride back across the bay',
        shape: 'rect',
        emoji: '⛴️',
        color: '#06b6d4',
        x: -360,
        y: 880,
        branches: [
          { id: 'bb-to-return-uber', label: 'Take Sunset Ferry ⛴️', targetNodeId: 'bday-return-uber' }
        ]
      },
      {
        id: 'bday-return-uber',
        title: 'Uber',
        subtitle: 'Final ride home after an epic birthday',
        shape: 'rect',
        emoji: '🚕',
        color: '#f59e0b',
        x: -360,
        y: 660,
        branches: [
          { id: 'bb-to-home-end', label: 'Uber Drive Home 🚗', targetNodeId: 'bday-return-home' }
        ]
      },
      {
        id: 'bday-return-home',
        title: 'HOME',
        subtitle: 'Safely back home! Best Birthday Trip Ever! 🎉🎂',
        shape: 'pill',
        emoji: '🎂',
        color: '#10b981',
        x: -360,
        y: 440,
        branches: []
      }
    ]
  },

  'date-night': {
    id: 'date-night',
    name: '❤️ Date Night Planner',
    description: 'Find the perfect date activity based on mood, budget, and cravings!',
    rootId: 'node-root',
    nodes: [
      {
        id: 'node-root',
        title: "What's the vibe for tonight?",
        subtitle: 'Pick how you both want to spend the evening',
        shape: 'pill',
        emoji: '✨',
        color: '#ec4899',
        x: 400,
        y: 80,
        branches: [
          { id: 'b-cozy', label: 'Cozy & Relaxed 🛋️', targetNodeId: 'node-cozy' },
          { id: 'b-active', label: 'High Energy & Adventure 🏎️', targetNodeId: 'node-active' },
          { id: 'b-foodie', label: 'Foodie Cravings 🍕', targetNodeId: 'node-foodie' }
        ]
      },
      {
        id: 'node-cozy',
        title: 'Staying In or Going Out?',
        subtitle: 'Are we putting on real pants tonight?',
        shape: 'diamond',
        emoji: '🏠',
        color: '#8b5cf6',
        x: 120,
        y: 280,
        branches: [
          { id: 'b-stay-in', label: 'Pajamas Stay In 🍿', targetNodeId: 'node-stay-in' },
          { id: 'b-cozy-out', label: 'Cute Cafe & Bookshop 📚', targetNodeId: 'node-cafe' }
        ]
      },
      {
        id: 'node-stay-in',
        title: 'Homemade Pizza & Movie Marathon 🍕🎬',
        subtitle: 'Bake your own personal pizzas together, make popcorn, and binge a classic movie trilogy!',
        shape: 'rect',
        emoji: '🍕',
        color: '#10b981',
        x: 40,
        y: 480,
        branches: []
      },
      {
        id: 'node-cafe',
        title: 'Indie Coffee & Board Game Lounge 🎲',
        subtitle: 'Grab warm lattes, pick a new board game to learn, and talk for hours in a cozy corner!',
        shape: 'rect',
        emoji: '☕',
        color: '#06b6d4',
        x: 280,
        y: 480,
        branches: []
      },
      {
        id: 'node-active',
        title: 'Competitive Spirit or Outdoors?',
        subtitle: 'How much adrenaline are we looking for?',
        shape: 'diamond',
        emoji: '🏆',
        color: '#f59e0b',
        x: 400,
        y: 280,
        branches: [
          { id: 'b-arcade', label: 'Arcade & Go-Karts 🏎️', targetNodeId: 'node-gokart' },
          { id: 'b-stars', label: 'Night Stargazing Picnic 🌌', targetNodeId: 'node-stargaze' }
        ]
      },
      {
        id: 'node-gokart',
        title: 'Neon Arcade & Go-Kart Racing Grand Prix 🏁',
        subtitle: 'Compete for highest air hockey score, race go-karts, and win silly stuffed prize animals!',
        shape: 'rect',
        emoji: '🎮',
        color: '#ec4899',
        x: 420,
        y: 480,
        branches: []
      },
      {
        id: 'node-stargaze',
        title: 'Scenic Viewpoint & Midnight Stargazing 🌠',
        subtitle: 'Drive up to a scenic overlook with blankets, hot cocoa, and a stargazing app!',
        shape: 'rect',
        emoji: '✨',
        color: '#3b82f6',
        x: 640,
        y: 480,
        branches: []
      },
      {
        id: 'node-foodie',
        title: 'Fancy & Elegant or Street Food Secret?',
        subtitle: 'What type of culinary journey?',
        shape: 'diamond',
        emoji: '🍷',
        color: '#ec4899',
        x: 720,
        y: 280,
        branches: [
          { id: 'b-fancy', label: 'Candlelight Speakeasy 🍸', targetNodeId: 'node-speakeasy' },
          { id: 'b-street', label: 'Night Market Crawl 🍡', targetNodeId: 'node-nightmarket' }
        ]
      },
      {
        id: 'node-speakeasy',
        title: 'Hidden Speakeasy & Craft Cocktail Tasting 🍸',
        subtitle: 'Find a secret entrance bar, order custom signature mixology drinks, and enjoy live Jazz!',
        shape: 'rect',
        emoji: '🎷',
        color: '#8b5cf6',
        x: 760,
        y: 480,
        branches: []
      },
      {
        id: 'node-nightmarket',
        title: 'Food Truck Rally & Dessert Progressive Dinner 🍦',
        subtitle: 'Appetizers at spot A, main course at spot B, and artisanal gelato for dessert!',
        shape: 'rect',
        emoji: '🌮',
        color: '#f59e0b',
        x: 980,
        y: 480,
        branches: []
      }
    ]
  },

  'coffee-decision': {
    id: 'coffee-decision',
    name: '☕ Coffee Decision Tree',
    description: 'Scientifically determine if you need another cup of coffee right now.',
    rootId: 'c-root',
    nodes: [
      {
        id: 'c-root',
        title: 'Should I drink another coffee right now?',
        subtitle: 'A crucial daily existential crisis',
        shape: 'pill',
        emoji: '☕',
        color: '#f59e0b',
        x: 400,
        y: 80,
        branches: [
          { id: 'cb-1', label: 'What time is it? 🕒', targetNodeId: 'c-time' }
        ]
      },
      {
        id: 'c-time',
        title: 'Check the Current Clock Time',
        subtitle: 'Circadian rhythm safety check',
        shape: 'diamond',
        emoji: '⏰',
        color: '#3b82f6',
        x: 400,
        y: 240,
        branches: [
          { id: 'cb-am', label: 'Before 2:00 PM ☀️', targetNodeId: 'c-sleep' },
          { id: 'cb-pm', label: 'After 5:00 PM 🌙', targetNodeId: 'c-night' }
        ]
      },
      {
        id: 'c-sleep',
        title: 'How many hours did you sleep last night?',
        subtitle: 'Energy deficit assessment',
        shape: 'diamond',
        emoji: '💤',
        color: '#8b5cf6',
        x: 200,
        y: 400,
        branches: [
          { id: 'cb-lowsleep', label: 'Under 6 Hours 🧟', targetNodeId: 'c-drink-espresso' },
          { id: 'cb-goodsleep', label: '7+ Hours 😃', targetNodeId: 'c-jitters' }
        ]
      },
      {
        id: 'c-drink-espresso',
        title: 'BREW A DOUBLE ESPRESSO IMMEDIATELY! ⚡',
        subtitle: 'You are legally classified as a zombie. Fuel up, warrior!',
        shape: 'rect',
        emoji: '🚀',
        color: '#ec4899',
        x: 60,
        y: 580,
        branches: []
      },
      {
        id: 'c-jitters',
        title: 'Are your hands currently vibrating?',
        subtitle: 'Jitter frequency test',
        shape: 'diamond',
        emoji: '🫨',
        color: '#f59e0b',
        x: 320,
        y: 580,
        branches: [
          { id: 'cb-j-yes', label: 'Yes, vibrating rapidly ⚡', targetNodeId: 'c-water' },
          { id: 'cb-j-no', label: 'Nope, steady as a rock 🪨', targetNodeId: 'c-iced-latte' }
        ]
      },
      {
        id: 'c-water',
        title: 'DRINK A BIG GLASS OF ICE WATER! 🚰',
        subtitle: 'You are already fully caffeinated into orbit. Hydrate, goblin!',
        shape: 'rect',
        emoji: '🧊',
        color: '#06b6d4',
        x: 220,
        y: 760,
        branches: []
      },
      {
        id: 'c-iced-latte',
        title: 'Treat Yourself to an Iced Oat Milk Latte! 🧋',
        subtitle: 'You earned it! Smooth energy boost unlocked.',
        shape: 'rect',
        emoji: '🎉',
        color: '#10b981',
        x: 440,
        y: 760,
        branches: []
      },
      {
        id: 'c-night',
        title: 'Do you plan on sleeping tonight?',
        subtitle: 'Night owl inquiry',
        shape: 'diamond',
        emoji: '🦉',
        color: '#ec4899',
        x: 640,
        y: 400,
        branches: [
          { id: 'cb-sleep-yes', label: 'Yes, need sleep 🛌', targetNodeId: 'c-chamomile' },
          { id: 'cb-sleep-no', label: 'No, all-nighter coding! 💻', targetNodeId: 'c-coldbrew' }
        ]
      },
      {
        id: 'c-chamomile',
        title: 'Switch to Chamomile Tea or Decaf 🫖',
        subtitle: 'Save your sleep schedule! Future you will thank you tomorrow.',
        shape: 'rect',
        emoji: '✨',
        color: '#10b981',
        x: 580,
        y: 580,
        branches: []
      },
      {
        id: 'c-coldbrew',
        title: 'CHUG A NITRO COLD BREW & SEIZE THE NIGHT! ⚡',
        subtitle: 'Bugs will be squashed, code will be committed. Victory awaits!',
        shape: 'rect',
        emoji: '🔥',
        color: '#8b5cf6',
        x: 800,
        y: 580,
        branches: []
      }
    ]
  },

  'tech-support': {
    id: 'tech-support',
    name: '💻 Tech Support Flow',
    description: 'Universal 100% foolproof hardware & software troubleshooting guide.',
    rootId: 't-root',
    nodes: [
      {
        id: 't-root',
        title: 'Is the tech device working properly?',
        subtitle: 'The universal IT ticket triage',
        shape: 'pill',
        emoji: '💻',
        color: '#3b82f6',
        x: 400,
        y: 80,
        branches: [
          { id: 'tb-yes', label: 'Yes, works fine! 👍', targetNodeId: 't-dont-touch' },
          { id: 'tb-no', label: 'No, it is broken! 🔥', targetNodeId: 't-plugged' }
        ]
      },
      {
        id: 't-dont-touch',
        title: 'DON\'T TOUCH ANYTHING! 🛑',
        subtitle: 'If it ain\'t broke, don\'t fix it or touch a single setting.',
        shape: 'rect',
        emoji: '🎉',
        color: '#10b981',
        x: 180,
        y: 260,
        branches: []
      },
      {
        id: 't-plugged',
        title: 'Is it actually plugged into wall power?',
        subtitle: 'Check cables & power strip switches',
        shape: 'diamond',
        emoji: '🔌',
        color: '#f59e0b',
        x: 550,
        y: 260,
        branches: [
          { id: 'tb-p-no', label: 'Oops, nope! 😅', targetNodeId: 't-plug-it' },
          { id: 'tb-p-yes', label: 'Yes, firmly plugged in 🔌', targetNodeId: 't-reboot' }
        ]
      },
      {
        id: 't-plug-it',
        title: 'Plug it in and press Power Button! 🔌',
        subtitle: 'Congratulations, you are now a certified Senior IT Engineer.',
        shape: 'rect',
        emoji: '👑',
        color: '#ec4899',
        x: 380,
        y: 440,
        branches: []
      },
      {
        id: 't-reboot',
        title: 'Have you turned it off and on again?',
        subtitle: 'The sacred IT chant',
        shape: 'diamond',
        emoji: '🔄',
        color: '#8b5cf6',
        x: 700,
        y: 440,
        branches: [
          { id: 'tb-r-no', label: 'Not yet 😬', targetNodeId: 't-do-reboot' },
          { id: 'tb-r-yes', label: 'Did it 3 times! 💥', targetNodeId: 't-percussive' }
        ]
      },
      {
        id: 't-do-reboot',
        title: 'Restart the Device Now 🔄',
        subtitle: 'Wait 10 seconds before turning it back on. 90% of bugs disappear here.',
        shape: 'rect',
        emoji: '✨',
        color: '#06b6d4',
        x: 580,
        y: 620,
        branches: []
      },
      {
        id: 't-percussive',
        title: 'Perform Percussive Maintenance 🔨',
        subtitle: 'Gently tap the side of the device while making a hopeful expression.',
        shape: 'rect',
        emoji: '🛠️',
        color: '#ec4899',
        x: 820,
        y: 620,
        branches: []
      }
    ]
  },

  'hero-quest': {
    id: 'hero-quest',
    name: "⚔️ Hero's Quest RPG",
    description: 'An epic interactive fantasy story flowchart!',
    rootId: 'h-root',
    nodes: [
      {
        id: 'h-root',
        title: 'You awaken at a crossroad in the Enchanted Forest 🌲',
        subtitle: 'Before you lie three mysterious paths...',
        shape: 'pill',
        emoji: '🏰',
        color: '#8b5cf6',
        x: 400,
        y: 80,
        branches: [
          { id: 'hb-cave', label: 'Enter Glowing Crystal Cave 💎', targetNodeId: 'h-cave' },
          { id: 'hb-tower', label: 'Climb Ancient Wizard Tower 🧙‍♂️', targetNodeId: 'h-tower' }
        ]
      },
      {
        id: 'h-cave',
        title: 'A sleeping Dragon blocks the chest! 🐲',
        subtitle: 'Shining gold glints behind its giant tail.',
        shape: 'diamond',
        emoji: '🐉',
        color: '#ec4899',
        x: 220,
        y: 260,
        branches: [
          { id: 'hb-stealth', label: 'Sneak past quietly 🤫', targetNodeId: 'h-loot' },
          { id: 'hb-fight', label: 'Draw Sword & Charge! ⚔️', targetNodeId: 'h-burned' }
        ]
      },
      {
        id: 'h-loot',
        title: 'VICTORY! You claim the Legendary Crown! 👑',
        subtitle: 'You slip past stealthily and secure infinite riches and eternal glory!',
        shape: 'rect',
        emoji: '🏆',
        color: '#10b981',
        x: 100,
        y: 460,
        branches: []
      },
      {
        id: 'h-burned',
        title: 'The Dragon wakes and sneezes fire! 🔥',
        subtitle: 'You are toasted to a crisp. Game Over!',
        shape: 'rect',
        emoji: '☠️',
        color: '#ef4444',
        x: 320,
        y: 460,
        branches: []
      },
      {
        id: 'h-tower',
        title: 'The Archmage offers you a Magic Spellbook 📖',
        subtitle: 'Which elemental spell do you choose?',
        shape: 'diamond',
        emoji: '✨',
        color: '#3b82f6',
        x: 600,
        y: 260,
        branches: [
          { id: 'hb-lightning', label: 'Lightning Bolt ⚡', targetNodeId: 'h-hero' },
          { id: 'hb-poly', label: 'Polymorph Frog 🐸', targetNodeId: 'h-frog' }
        ]
      },
      {
        id: 'h-hero',
        title: 'You become the Supreme Sorcerer of the Realm! ⚡',
        subtitle: 'Your lightning spell vanquishes darkness forever!',
        shape: 'rect',
        emoji: '🧙‍♂️',
        color: '#06b6d4',
        x: 520,
        y: 460,
        branches: []
      },
      {
        id: 'h-frog',
        title: 'You accidentally turn yourself into a frog! 🐸',
        subtitle: 'Ribbit! Better start looking for a friendly princess to kiss you.',
        shape: 'rect',
        emoji: '👑',
        color: '#f59e0b',
        x: 740,
        y: 460,
        branches: []
      }
    ]
  }
};
