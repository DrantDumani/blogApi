const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcrypt");

async function main() {
  await prisma.users.deleteMany();
  await prisma.tags.deleteMany();

  const king = await prisma.users.create({
    data: {
      username: "The King",
      email: "yourmajesty@quatal.com",
      password: await bcrypt.hash("password1", 10),
      role: "Super",
      blogPosts: {
        create: [
          {
            title: "I have arrived!",
            subTitle: "Quatal is my reward!",
            content:
              "Years of training in Erionia have rewarded me with this moment! Together, we shall bring back Relinca's Quatal!",
            timestamp: new Date(523801479275),
            tags: {
              connectOrCreate: [
                { where: { name: "Personal" }, create: { name: "Personal" } },
                {
                  where: { name: "Achievements" },
                  create: { name: "Achievements" },
                },
              ],
            },
            published: true,
          },
          {
            title: "Erionian Summoning is Amazing!",
            subTitle: "How I learned to fend for myself in the Erionian slums",
            content:
              "Summoning isn't only limited to the beings you create with your life energy. You can create summoning contracts with inanimate objects as well! My armory now goes with me wherever I go.",
            timestamp: new Date(676482224135),
            tags: {
              connectOrCreate: [
                { where: { name: "Travel" }, create: { name: "Travel" } },
                {
                  where: { name: "Achievements" },
                  create: { name: "Achievements" },
                },
              ],
            },
            published: false,
          },
          {
            title: "My goal to ally with the gryphons once again.",
            subTitle: "I'm going to do battle with them first",
            content:
              "The mountain and desert gryphons were there in the beginning. It's time to repair the relationship and recall the Quatal that Relinca created.",
            timestamp: new Date(962219344323),
            tags: {
              connectOrCreate: [
                { where: { name: "Politics" }, create: { name: "Politics" } },
                { where: { name: "Quatal" }, create: { name: "Quatal" } },
                { where: { name: "Goals" }, create: { name: "Goals" } },
              ],
            },
            published: false,
          },
          {
            title: "I am radiant no matter where I go.",
            subTitle: "Even the Yurosian army agrees",
            content:
              "They say my domain magic is a crutch? Ha! I am a formidable foe even on the Lyshian battleground. Even in Drejin, they were forced to accept my near unmatched strength. The army walks alongside me, matching my pace. The only one who beats my record is Veren Oseer, Lumalto's guardian.",
            timestamp: new Date(962727372423),
            tags: {
              connectOrCreate: [
                { where: { name: "Personal" }, create: { name: "Personal" } },
                { where: { name: "General" }, create: { name: "General" } },
              ],
            },
            published: true,
          },
        ],
      },
    },
  });

  const kingPosts = await prisma.posts.findMany({
    where: {
      authorId: king.id,
    },
  });

  const veren = await prisma.users.create({
    data: {
      username: "MountainHunter",
      email: "iloveGloria@quatal.com",
      password: await bcrypt.hash("password2", 10),
      role: "Author",
      blogPosts: {
        create: [
          {
            title: "For Darabos' eyes only",
            subTitle:
              "It seems you want to end this war. Then we have much to discuss",
            content:
              "Do you truly believe that the war will end once I am defeated? You couldn't possibly be that foolish. I am not your enemy.",
            timestamp: new Date(),
            tags: {
              create: [{ name: "Beyond" }],
            },
          },
        ],
      },
      comments: {
        create: [
          {
            timestamp: new Date(136881469898),
            content: "You've suffered so much thanks to your mother...",
            blogPost: {
              connect: {
                id: kingPosts[0].id,
              },
            },
          },
        ],
      },
      likes: {
        connect: {
          id: kingPosts[0].id,
        },
      },
    },
  });

  const shirone = await prisma.users.create({
    data: {
      username: "GloriousJustice",
      email: "mytriumph@erionia.com",
      password: await bcrypt.hash("password3", 10),
      comments: {
        create: [
          {
            content:
              "It's important to rise above all when the world attempts to squash your very existence",
            timestamp: new Date(747144046167),
            blogPost: {
              connect: {
                id: kingPosts[3].id,
              },
            },
          },
        ],
      },
      likes: {
        connect: {
          id: kingPosts[3].id,
        },
      },
    },
  });

  const lorkor = await prisma.users.create({
    data: {
      username: "Armored Claw",
      email: "obsidian@quatal.com",
      password: await bcrypt.hash("password4", 10),
      comments: {
        create: {
          content:
            "Don't you dare say her name. I'll tear your body apart and scatter the bones across the ground.",
          timestamp: new Date(1554097464467),
          blogPost: {
            connect: {
              id: kingPosts[0].id,
            },
          },
        },
      },
    },
  });

  const shorel = await prisma.users.create({
    data: {
      username: "Sandy Shores",
      email: "soldier@grutelro.com",
      password: await bcrypt.hash("password5", 10),
      comments: {
        create: {
          content: "Um...well...you are standing your ground.",
          timestamp: new Date(699679495591),
          blogPost: {
            connect: {
              id: kingPosts[3].id,
            },
          },
        },
      },
      likes: {
        connect: {
          id: kingPosts[3].id,
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
