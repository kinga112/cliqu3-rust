export type XMTPMessage = {
  id: string;
  content: string;
  content_type: string;
  from: string;
  timestamp: string;
};

// export interface Message {
//   id: string;
//   chatId: string;
//   origin: string;
//   timestamp: number;
//   from: string;
//   message: Content | ReferenceContent;
//   group: boolean;
//   cid: string;
//   reply: Reply | null;
//   reactions: {
//     [emoji: string]: {
//       count: number;
//       users: string[]
//     };
//   };
// }

// export interface Reply {
//   from: string;
//   message: string;
//   reference: string;
// }

// export interface Content {
//   type: string;
//   content: string;
// }

// export interface ReferenceContent {
//   type: string;
//   content: Content;
//   reference: string;
// }

export const EMOJIs = {
  THUMBSUP: "\u{1F44D}",
  THUMBSDOWN: "\u{1F44E}",
  HEART: "\u{2764}\u{FE0F}",
  CLAP: "\u{1F44F}",
  FIRE: "\u{1F525}",
  LAUGH: "\u{1F602}",
  SAD: "\u{1F622}",
  SUPRISE: "\u{1F632}",
  GRINNING: "\u{1F600}",
  GRINNING_BIG_EYES: "\u{1F603}",
  GRINNING_SMILING_EYES: "\u{1F604}",
  BEAMING_SMILING_EYES: "\u{1F601}",
  GRINNING_SQUINTING: "\u{1F606}",
  GRINNING_WITH_SWEAT: "\u{1F605}",
  ROFL: "\u{1F923}",
  SLIGHT_SMILE: "\u{1F642}",
  UPSIDE_DOWN: "\u{1F643}",
  MELTING: "\u{1FAE0}",
  WINKING: "\u{1F609}",
  BLUSHING: "\u{1F60A}",
  ANGEL: "\u{1F607}",
  SMILE_WITH_HEARTS: "\u{1F970}",
  SMILE_HEART_EYES: "\u{1F60D}",
  SMILE_STAR_EYES: "\u{1F929}",
  BLOWING_KISS: "\u{1F618}",
  KISSING: "\u{1F617}",
  KISSING_CLOSED_EYES: "\u{1F61A}",
  KISSING_SMILE_EYES: "\u{1F619}",
  SMILING_WITH_TEAR: "\u{1F972}",
  SAVORING_FOOD: "\u{1F60B}",
  FACE_WITH_TONGUE: "\u{1F61B}",
  WINKING_TONGUE: "\u{1F61C}",
  ZANY: "\u{1F92A}",
  SQUINTING_WITH_TONGUE: "\u{1F61D}",
  MONEY_MOUTH: "\u{1F911}",
  SMILING_WITH_HANDS: "\u{1F917}",
  HAND_OVER_MOUTH: "\u{1F92D}",
  HAND_OVER_MOUTH_OPEN_EYES: "\u{1FAE2}",
  PEAKING_EYE: "\u{1FAE3}",
  SHUSH: "\u{1F92B}",
  THINKING: "\u{1F914}",
  SALUTE: "\u{1FAE1}",
  ZIPPER_MOUTH: "\u{1F910}",
  RAISED_EYEBROW: "\u{1F928}",
  NEUTRAL: "\u{1F610}",
  EXPRESSIONLESS: "\u{1F611}",
  WITHOUT_MOUTH: "\u{1F636}",
  DOTTED_LINE: "\u{1FAE5}",
  SMIRK: "\u{1F60F}",
  UNAMUSED: "\u{1F612}",
  ROLLING_EYES: "\u{1F644}",
  GRIMACING: "\u{1F62C}",
  LYING: "\u{1F925}",
  SHAKING: "\u{1FAE8}",
  RELIEVED: "\u{1F60C}",
  PENSIVE: "\u{1F614}",
  SLEEPY: "\u{1F62A}",
  DROOLING: "\u{1F924}",
  SLEEPING: "\u{1F634}",
  MASK: "\u{1F637}",
  THERMOMETER: "\u{1F912}",
  HEAD_BANDAGE: "\u{1F915}",
  NAUSEATED: "\u{1F922}",
  VOMITING: "\u{1F92E}",
  SNEEZING: "\u{1F927}",
  HOT: "\u{1F975}",
  COLD: "\u{1F976}",
  WOOZY: "\u{1F974}",
  CROSSED_OUT_EYES: "\u{1F635}",
  EXPLODING_HEAD: "\u{1F92F}",
  COWBOY: "\u{1F920}",
  PARTY: "\u{1F973}",
  DISGUISED: "\u{1F978}",
  SUNGLASSES: "\u{1F60E}",
  NERD: "\u{1F913}",
  MONOCLE: "\u{1F9D0}",
  CONFUSED: "\u{1F615}",
  DIAGONAL_MOUTH: "\u{1FAE4}",
  WORRIED: "\u{1F61F}",
  SLIGHT_FROWN: "\u{1F641}",
  OPEN_MOUTH: "\u{1F62E}",
  HUSHED: "\u{1F62F}",
  FLUSHED: "\u{1F633}",
  PLEADING: "\u{1F97A}",
  HOLDING_BACK_TEARS: "\u{1F979}",
  FROWN_OPEN_MOUTH: "\u{1F626}",
  ANGUISHED: "\u{1F627}",
  FEARFUL: "\u{1F628}",
  ANXIOUS: "\u{1F630}",
  SAD_RELIEVED: "\u{1F625}",
  CRYING_LOUD: "\u{1F62D}",
  SCREAMING: "\u{1F631}",
  CONFOUNDED: "\u{1F616}",
  PRESERVING: "\u{1F623}",
  DISAPOINTED: "\u{1F61E}",
  DOWNCAST: "\u{1F613}",
  WEARY: "\u{1F629}",
  TIRED: "\u{1F62B}",
  YAWNING: "\u{1F971}",
  STEAM_FROM_NOSE: "\u{1F624}",
  ANGRY: "\u{1F620}",
  ENRAGED: "\u{1F621}",
  CURSING: "\u{1F92C}",
  SMILING_DEVIL: "\u{1F608}",
  ANGRY_DEVIL: "\u{1F47F}",
  SKULL: "\u{1F480}",
  CROSSBONES: "\u{2620}",
  POOP: "\u{1F4A9}",
  CLOWN: "\u{1F921}",
  HUNDRED: "\u{1F4AF}",
  ZZZ: "\u{1F4A4}",
  OK_HAND: "\u{1F44C}",
  PINCHED_HAND: "\u{1F90C}",
  PEACE_HAND: "\u{270C}",
  CROSSED_HAND: "\u{1F91E}",
  ILY_HAND: "\u{1F91F}",
  ROCKON_HAND: "\u{1F918}",
  CALLME_HAND: "\u{1F919}",
  HEART_HAND: "\u{1FAF6}",
  PRAYER_HAND: "\u{1F64F}",
  FLEX: "\u{1F4AA}",
};
