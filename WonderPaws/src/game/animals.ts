import type { Animal } from "./types";

function animal(
  id: string,
  displayName: string,
  speciesGroup: string,
  worldId: string,
  habitats: string[],
  movement: string[],
  properties: string[],
  climate: string,
  size: number,
  isMythical: boolean,
  diet: string,
  assetKey: Animal["assetKey"],
  description: string,
): Animal {
  return { id, displayName, speciesGroup, worldId, habitats, movement, properties, climate, size, isMythical, diet, assetKey, description };
}

export const animals: Animal[] = [
  animal("chicken", "Chicken", "bird", "meadows", ["farm", "land"], ["land"], ["feathers", "farm-animal"], "temperate", 1, false, "omnivore", "chicken", "A curious farm bird that likes scratching in the grass."),
  animal("rooster", "Rooster", "bird", "meadows", ["farm", "land"], ["land", "short-flight"], ["feathers", "farm-animal", "crows"], "temperate", 2, false, "omnivore", "chicken", "A confident farm bird with a very loud morning call."),
  animal("duck", "Duck", "bird", "meadows", ["farm", "wetland", "water"], ["land", "swim", "fly"], ["feathers", "farm-animal"], "temperate", 2, false, "omnivore", "chicken", "A playful bird that swims and can fly."),
  animal("cow", "Cow", "mammal", "meadows", ["farm", "land"], ["land"], ["farm-animal"], "temperate", 5, false, "herbivore", "cow", "A gentle, large farm animal."),
  animal("pig", "Pig", "mammal", "meadows", ["farm", "land"], ["land"], ["farm-animal", "mud-loving"], "temperate", 3, false, "omnivore", "cow", "A playful farm animal that enjoys muddy puddles."),
  animal("sheep", "Sheep", "mammal", "meadows", ["farm", "land"], ["land"], ["wool", "farm-animal"], "temperate", 3, false, "herbivore", "cow", "A shy farm animal with a thick woolly coat."),
  animal("horse", "Horse", "mammal", "meadows", ["farm", "land"], ["land"], ["farm-animal"], "temperate", 5, false, "herbivore", "cow", "A fast and proud farm animal."),
  animal("goat", "Goat", "mammal", "meadows", ["farm", "land"], ["land", "climb"], ["farm-animal"], "temperate", 2, false, "herbivore", "cow", "A mischievous climber with a curious nose."),
  animal("rabbit", "Rabbit", "mammal", "meadows", ["farm", "woodland", "land"], ["land", "hop"], ["small", "long-ears"], "temperate", 1, false, "herbivore", "rabbit", "A quick little mammal with long ears."),
  animal("donkey", "Donkey", "mammal", "meadows", ["farm", "land"], ["land"], ["farm-animal"], "temperate", 4, false, "herbivore", "cow", "A sturdy and lovable farm helper."),
  animal("turkey", "Turkey", "bird", "meadows", ["farm", "land"], ["land", "short-flight"], ["feathers", "farm-animal"], "temperate", 3, false, "omnivore", "chicken", "A dramatic bird that struts around the farm."),
  animal("goose", "Goose", "bird", "meadows", ["farm", "wetland", "water"], ["land", "swim", "fly"], ["feathers", "farm-animal"], "temperate", 3, false, "omnivore", "chicken", "A bold bird that enjoys ponds and open fields."),
  animal("golden_chicken", "Golden Chicken", "bird", "meadows", ["farm", "land"], ["land"], ["feathers", "farm-animal", "rare"], "temperate", 1, false, "omnivore", "chicken", "A rare golden-feathered chicken. It is still a farm bird."),
  animal("emperor_penguin", "Emperor Penguin", "bird", "frozen", ["antarctic", "coast"], ["land", "swim"], ["feathers", "cannot-fly", "polar"], "antarctic", 4, false, "carnivore", "penguin", "A large Antarctic bird that swims but cannot fly."),
  animal("king_penguin", "King Penguin", "bird", "frozen", ["antarctic", "coast"], ["land", "swim"], ["feathers", "cannot-fly", "polar"], "antarctic", 3, false, "carnivore", "penguin", "A confident Antarctic penguin that swims in cold seas."),
  animal("baby_penguin", "Baby Penguin", "bird", "frozen", ["antarctic", "coast"], ["land", "swim"], ["feathers", "cannot-fly", "polar"], "antarctic", 1, false, "carnivore", "penguin", "A fluffy penguin chick learning to slide and swim."),
  animal("polar_bear", "Polar Bear", "mammal", "frozen", ["arctic", "coast"], ["land", "swim"], ["polar", "large"], "arctic", 5, false, "carnivore", "penguin", "A large Arctic mammal that can swim. It does not live in Antarctica."),
  animal("arctic_fox", "Arctic Fox", "mammal", "frozen", ["arctic", "land"], ["land"], ["polar", "thick-fur"], "arctic", 2, false, "omnivore", "rabbit", "A clever small mammal with thick Arctic fur."),
  animal("seal", "Seal", "mammal", "frozen", ["polar", "coast", "water"], ["land", "swim"], ["polar", "flippers"], "polar", 3, false, "carnivore", "penguin", "A playful coastal mammal that swims very well."),
  animal("walrus", "Walrus", "mammal", "frozen", ["arctic", "coast"], ["land", "swim"], ["polar", "tusks"], "arctic", 5, false, "carnivore", "cow", "A large Arctic mammal with long tusks."),
  animal("snowy_owl", "Snowy Owl", "bird", "frozen", ["arctic", "land"], ["land", "fly"], ["polar", "feathers", "flight"], "arctic", 2, false, "carnivore", "penguin", "A wise Arctic bird with powerful wings."),
  animal("reindeer", "Reindeer", "mammal", "frozen", ["arctic", "land"], ["land"], ["polar", "antlers"], "arctic", 4, false, "herbivore", "cow", "A fast mammal that travels across Arctic land."),
  animal("snow_leopard", "Snow Leopard", "mammal", "frozen", ["mountain", "land"], ["land", "climb"], ["thick-fur", "stealth"], "mountain", 4, false, "carnivore", "rabbit", "A stealthy mountain cat with a thick coat."),
  animal("arctic_hare", "Arctic Hare", "mammal", "frozen", ["arctic", "land"], ["land", "hop"], ["polar", "small"], "arctic", 1, false, "herbivore", "rabbit", "A very quick hare that lives in Arctic regions."),
  animal("orca", "Orca", "mammal", "frozen", ["ocean", "water"], ["swim"], ["marine", "pod"], "ocean", 5, false, "carnivore", "penguin", "A powerful marine mammal that lives in oceans."),
  animal("trex", "T-Rex", "dinosaur", "jurassic", ["prehistoric", "land"], ["land"], ["carnivore", "large"], "prehistoric", 5, false, "carnivore", "trex", "A large meat-eating dinosaur with a powerful bite."),
  animal("triceratops", "Triceratops", "dinosaur", "jurassic", ["prehistoric", "land"], ["land"], ["horns", "herbivore"], "prehistoric", 4, false, "herbivore", "trex", "A plant-eating dinosaur with three horns."),
  animal("stegosaurus", "Stegosaurus", "dinosaur", "jurassic", ["prehistoric", "land"], ["land"], ["plates", "herbivore"], "prehistoric", 4, false, "herbivore", "trex", "A gentle dinosaur with plates along its back."),
  animal("brachiosaurus", "Brachiosaurus", "dinosaur", "jurassic", ["prehistoric", "land"], ["land"], ["very-large", "herbivore"], "prehistoric", 5, false, "herbivore", "trex", "A very large, long-necked plant eater."),
  animal("velociraptor", "Velociraptor", "dinosaur", "jurassic", ["prehistoric", "land"], ["land", "run"], ["small", "clever"], "prehistoric", 2, false, "carnivore", "trex", "A small, quick dinosaur that hunted in groups."),
  animal("ankylosaurus", "Ankylosaurus", "dinosaur", "jurassic", ["prehistoric", "land"], ["land"], ["armour", "herbivore"], "prehistoric", 4, false, "herbivore", "trex", "An armoured dinosaur with a strong tail club."),
  animal("spinosaurus", "Spinosaurus", "dinosaur", "jurassic", ["prehistoric", "land", "water"], ["land", "swim"], ["sail", "aquatic-hunter"], "prehistoric", 5, false, "carnivore", "trex", "A large dinosaur associated with water and fishing."),
  animal("parasaurolophus", "Parasaurolophus", "dinosaur", "jurassic", ["prehistoric", "land"], ["land"], ["crest", "herbivore"], "prehistoric", 4, false, "herbivore", "trex", "A plant-eating dinosaur with a long head crest."),
  animal("pteranodon", "Pteranodon", "prehistoric-reptile", "jurassic", ["prehistoric", "air", "coast"], ["air", "glide"], ["wings", "flight"], "prehistoric", 3, false, "carnivore", "trex", "A flying prehistoric reptile, not a dinosaur."),
  animal("pachycephalosaurus", "Pachycephalosaurus", "dinosaur", "jurassic", ["prehistoric", "land"], ["land"], ["dome-head", "herbivore"], "prehistoric", 3, false, "herbivore", "trex", "A dinosaur with a thick, domed skull."),
  animal("diplodocus", "Diplodocus", "dinosaur", "jurassic", ["prehistoric", "land"], ["land"], ["very-large", "herbivore"], "prehistoric", 5, false, "herbivore", "trex", "A very large long-necked plant-eating dinosaur."),
  animal("mosasaurus", "Mosasaurus", "prehistoric-marine-reptile", "jurassic", ["prehistoric", "ocean", "water"], ["swim"], ["marine", "large"], "prehistoric", 5, false, "carnivore", "trex", "A huge prehistoric marine reptile."),
  animal("unicorn", "Unicorn", "mythical", "mythical", ["enchanted-forest", "land"], ["land"], ["horn", "magic"], "fantasy", 3, true, "herbivore", "unicorn", "A fantasy creature with a magical horn."),
  animal("baby_dragon", "Baby Dragon", "mythical", "mythical", ["dragon-cave", "land", "air"], ["land", "air"], ["scales", "fire"], "fantasy", 2, true, "omnivore", "unicorn", "A small fantasy dragon that can breathe tiny puffs of fire."),
  animal("phoenix", "Phoenix", "mythical", "mythical", ["sky", "air"], ["air", "fly"], ["fire", "feathers"], "fantasy", 3, true, "omnivore", "unicorn", "A legendary bird associated with fire and rebirth."),
  animal("pegasus", "Pegasus", "mythical", "mythical", ["sky", "land"], ["air", "land", "fly"], ["wings"], "fantasy", 4, true, "herbivore", "unicorn", "A winged horse from fantasy stories."),
  animal("griffin", "Griffin", "mythical", "mythical", ["sky", "land"], ["air", "land", "fly"], ["wings", "claws"], "fantasy", 4, true, "carnivore", "unicorn", "A fantasy creature with a lion's body and an eagle's head."),
  animal("cerberus", "Cerberus", "mythical", "mythical", ["underworld", "land"], ["land"], ["three-heads"], "fantasy", 5, true, "carnivore", "unicorn", "A three-headed dog from mythology."),
  animal("fairy_deer", "Fairy Deer", "mythical", "mythical", ["enchanted-forest", "land"], ["land"], ["magic", "antlers"], "fantasy", 3, true, "herbivore", "unicorn", "A gentle deer with magical powers."),
  animal("mermaid", "Mermaid", "mythical", "mythical", ["sea", "water"], ["swim"], ["tail"], "fantasy", 3, true, "omnivore", "unicorn", "A mythical being that lives in the sea."),
  animal("yeti", "Yeti", "mythical", "mythical", ["snowy-mountain", "land"], ["land"], ["large", "thick-fur"], "fantasy", 5, true, "omnivore", "unicorn", "A large, shy creature from snowy legends."),
  animal("griffin_cub", "Griffin Cub", "mythical", "mythical", ["sky", "land"], ["air", "land", "fly"], ["wings", "claws", "young"], "fantasy", 2, true, "carnivore", "unicorn", "A playful young griffin learning to fly."),
  animal("hydra", "Hydra", "mythical", "mythical", ["sea", "land", "water"], ["swim", "land"], ["multiple-heads", "scales"], "fantasy", 5, true, "carnivore", "unicorn", "A many-headed creature from fantasy stories."),
  animal("sea_serpent", "Sea Serpent", "mythical", "mythical", ["sea", "water"], ["swim"], ["scales"], "fantasy", 5, true, "carnivore", "unicorn", "A mysterious mythical creature that swims in the sea."),
];

export const animalById = Object.fromEntries(animals.map((item) => [item.id, item])) as Record<string, Animal>;
export const animalsByWorld = {
  meadows: animals.filter((item) => item.worldId === "meadows").map((item) => item.id),
  frozen: animals.filter((item) => item.worldId === "frozen").map((item) => item.id),
  jurassic: animals.filter((item) => item.worldId === "jurassic").map((item) => item.id),
  mythical: animals.filter((item) => item.worldId === "mythical").map((item) => item.id),
};

/**
 * The game currently ships only six base character sprites (chicken, cow, rabbit,
 * penguin, trex, unicorn — see `assetKey`), reused across every species in a world.
 * Left alone, that means e.g. the arctic fox, snow leopard and arctic hare all render
 * as the exact same farm rabbit, and the walrus/reindeer render as the exact same dairy
 * cow. This table gives every non-exact-match species its own CSS tint (`filter`) and a
 * small badge icon so animals stay visually distinguishable until bespoke art exists.
 * Species not listed here are a true match for their `assetKey` sprite and need no tint.
 */
export const animalVisuals: Record<string, { filter?: string; badge?: string }> = {
  // Domestic Meadows — reusing the chicken/cow sprites
  rooster: { filter: "sepia(0.15) saturate(1.15) hue-rotate(-8deg)", badge: "🐓" },
  duck: { filter: "hue-rotate(165deg) saturate(0.8) brightness(1.05)", badge: "🦆" },
  pig: { filter: "hue-rotate(-20deg) saturate(1.3) brightness(1.1)", badge: "🐷" },
  sheep: { filter: "brightness(1.3) saturate(0.4)", badge: "🐑" },
  horse: { filter: "sepia(0.25) saturate(1.1) brightness(0.95)", badge: "🐴" },
  goat: { filter: "saturate(0.6) brightness(1.1) hue-rotate(10deg)", badge: "🐐" },
  donkey: { filter: "grayscale(0.5) brightness(0.95)", badge: "🫏" },
  turkey: { filter: "sepia(0.3) saturate(1.2) hue-rotate(-15deg)", badge: "🦃" },
  goose: { filter: "brightness(1.15) saturate(0.5) hue-rotate(10deg)", badge: "🪿" },
  golden_chicken: { filter: "sepia(0.6) saturate(2) hue-rotate(-10deg) brightness(1.15)", badge: "✨" },

  // Frozen Kingdom — reusing the penguin/cow/rabbit sprites
  king_penguin: { filter: "saturate(1.15) hue-rotate(15deg)", badge: "🐧" },
  baby_penguin: { filter: "brightness(1.2) saturate(0.6)", badge: "🐣" },
  polar_bear: { filter: "grayscale(0.7) brightness(1.35) saturate(0.2)", badge: "🐻‍❄️" },
  arctic_fox: { filter: "grayscale(0.55) brightness(1.3) saturate(0.25) hue-rotate(180deg)", badge: "🦊" },
  seal: { filter: "grayscale(0.5) brightness(1.1) saturate(0.3) hue-rotate(190deg)", badge: "🦭" },
  walrus: { filter: "sepia(0.35) saturate(0.7) brightness(0.85) hue-rotate(-10deg)", badge: "🦣" },
  snowy_owl: { filter: "grayscale(0.6) brightness(1.4) saturate(0.15)", badge: "🦉" },
  reindeer: { filter: "sepia(0.4) saturate(0.8) brightness(0.9) hue-rotate(-5deg)", badge: "🦌" },
  snow_leopard: { filter: "grayscale(0.45) brightness(1.2) saturate(0.35) contrast(1.1)", badge: "🐆" },
  arctic_hare: { filter: "grayscale(0.6) brightness(1.35) saturate(0.2)", badge: "🐇" },
  orca: { filter: "grayscale(0.8) brightness(0.9) contrast(1.15) hue-rotate(200deg)", badge: "🐋" },

  // Jurassic Jungle — reusing the trex sprite
  triceratops: { filter: "hue-rotate(60deg) saturate(1.1) brightness(0.95)", badge: "🦕" },
  stegosaurus: { filter: "hue-rotate(100deg) saturate(0.9) brightness(1)", badge: "🦕" },
  brachiosaurus: { filter: "hue-rotate(130deg) saturate(0.8) brightness(1.1)", badge: "🦕" },
  velociraptor: { filter: "saturate(1.3) brightness(0.85) hue-rotate(-20deg)", badge: "🦖" },
  ankylosaurus: { filter: "sepia(0.3) saturate(0.7) brightness(0.9)", badge: "🦕" },
  spinosaurus: { filter: "hue-rotate(190deg) saturate(1.1) brightness(0.95)", badge: "🦖" },
  parasaurolophus: { filter: "hue-rotate(40deg) saturate(1) brightness(1.05)", badge: "🦕" },
  pteranodon: { filter: "grayscale(0.3) brightness(1.15) saturate(0.6)", badge: "🦅" },
  pachycephalosaurus: { filter: "sepia(0.2) hue-rotate(10deg) saturate(0.9)", badge: "🦕" },
  diplodocus: { filter: "hue-rotate(150deg) saturate(0.75) brightness(1.05)", badge: "🦕" },
  mosasaurus: { filter: "hue-rotate(200deg) saturate(1.2) brightness(0.85)", badge: "🐊" },

  // Mythical Realms — reusing the unicorn sprite
  baby_dragon: { filter: "hue-rotate(-90deg) saturate(1.3) brightness(0.95)", badge: "🐉" },
  phoenix: { filter: "hue-rotate(-60deg) saturate(1.4) brightness(1.1)", badge: "🔥" },
  pegasus: { filter: "grayscale(0.4) brightness(1.2) saturate(0.5)", badge: "🪽" },
  griffin: { filter: "sepia(0.3) saturate(1.1) brightness(0.95)", badge: "🦅" },
  cerberus: { filter: "grayscale(0.5) brightness(0.8) saturate(0.6)", badge: "🐕" },
  fairy_deer: { filter: "hue-rotate(90deg) saturate(1.2) brightness(1.1)", badge: "🦌" },
  mermaid: { filter: "hue-rotate(160deg) saturate(1.2) brightness(1.05)", badge: "🧜" },
  yeti: { filter: "grayscale(0.7) brightness(1.3) saturate(0.2)", badge: "❄️" },
  griffin_cub: { filter: "sepia(0.2) saturate(1) brightness(1.15)", badge: "🦅" },
  hydra: { filter: "hue-rotate(110deg) saturate(1.3) brightness(0.9)", badge: "🐍" },
  sea_serpent: { filter: "hue-rotate(180deg) saturate(1.2) brightness(0.95)", badge: "🐍" },
};

export const propertyLabels: Record<string, string> = {
  id: "species",
  speciesGroup: "animal group",
  worldId: "world",
  habitats: "habitat",
  movement: "movement",
  properties: "special feature",
  climate: "climate",
  size: "size",
  isMythical: "magical creature",
  diet: "diet",
  loopCounter: "loop counter",
};

export function propertyOptions(property: string, animalIds: string[]): (string | number | boolean)[] {
  if (property === "loopCounter") return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const values = new Set<string | number | boolean>();
  for (const id of animalIds) {
    const item = animalById[id];
    if (!item) continue;
    const value = item[property as keyof Animal];
    if (Array.isArray(value)) value.forEach((entry) => values.add(String(entry)));
    else if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") values.add(value);
  }
  return Array.from(values).sort((a, b) => String(a).localeCompare(String(b)));
}
