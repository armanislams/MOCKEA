import mongoose from 'mongoose';
import 'dotenv/config';
import Questions from './src/model/questions.js';
import MockTest from './src/model/mockTest.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define MONGODB_URI in backend/.env");
  process.exit(1);
}

const seed = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully!");

    console.log("Cleaning up existing seed data...");
    await Questions.deleteMany({ title: /Academic IELTS/ });
    await MockTest.deleteMany({ title: 'IELTS Academic Real-World Mock Test 1' });

    // 1. Create Listening Questions (40 questions)
    console.log("Creating Listening questions...");
    const listeningQuestions = await Questions.create({
      testType: 'listening',
      title: 'Academic IELTS Listening Practice Test 1',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // high-quality sample audio
      instructions: 'Listen to the audio and answer the questions below. For gap-fill questions, use NO MORE THAN TWO WORDS and/or a number.',
      forPlanType: 'free',
      isPublic: true,
      passage: `
<h3>Section 3: Student Discussion on The Secret Garden</h3>
Novel: (21) ___21___
Protagonists: Mary Lennox; Colin Craven
Time period: Early in (22) ___22___
Mary moves to UK – meets Colin who thinks he'll never be able to (23) ___23___. They become friends.
Point of view: "Omniscient" - narrator knows all about characters' feelings, opinions and (24) ___24___.
Audience: Good for children - story simple to follow
Symbols (physical items that represent (25) ___25___):
* the robin redbreast
* (26) ___26___
* the portrait of Mistress Craven
Motifs (patterns in the story):
* the Garden of Eden
* secrecy - transition from (27) ___27___
Themes:
* the connection between (28) ___28___ and outlook
* the connection between (29) ___29___ and well-being
* individuals and the need for (30) ___30___

<hr class="my-8 border-slate-200" />

<h3>Section 4: Academic Lecture on Time Perspectives</h3>

| Time Zone | Outlook | Features & Consequences |
|---|---|---|
| Past | Positive | Remember good times, e.g. birthdays. Keep family records, photo albums, etc. |
| | (31) ___31___ | Focus on disappointments, failures, bad decisions. |
| Present | Hedonistic | Live for (32) ___32___; seek sensation; avoid pain. |
| | Fatalistic | Life is governed by (33) ___33___, religious beliefs, social conditions. Life’s path can’t be changed. |
| Future | (34) ___34___ | Prefer work to play. Don’t give in to temptation. |
| | Fatalistic | Have a strong belief in life after death and importance of (35) ___35___ in life. |
      `,
      questions: [
        // Section 1: Form Completion (1-10)
        { id: 'l1', type: 'short-answer', question: 'Customer Name:', correctAnswer: 'Sarah Jenkins' },
        { id: 'l2', type: 'short-answer', question: 'Contact Number:', correctAnswer: '07700900077' },
        { id: 'l3', type: 'short-answer', question: 'Source Address:', correctAnswer: '14 Maple Avenue' },
        { id: 'l4', type: 'short-answer', question: 'Destination City:', correctAnswer: 'Bristol' },
        { id: 'l5', type: 'short-answer', question: 'Moving Date:', correctAnswer: '25th October' },
        { id: 'l6', type: 'short-answer', question: 'Items to pack: Kitchenware and _______', correctAnswer: 'books' },
        { id: 'l7', type: 'short-answer', question: 'Furniture to disassemble: Dining _______', correctAnswer: 'table' },
        { id: 'l8', type: 'short-answer', question: 'Number of large boxes needed:', correctAnswer: '12' },
        { id: 'l9', type: 'short-answer', question: 'Special instructions: Handle _______ with extreme care', correctAnswer: 'glassware' },
        { id: 'l10', type: 'short-answer', question: 'Total estimated cost (£):', correctAnswer: '450' },

        // Section 2: Local Museum Talk (11-20)
        { 
          id: 'l11', 
          type: 'multiple-choice', 
          question: 'When was the museum first opened to the general public?', 
          options: ['1925', '1953', '1978'], 
          correctAnswer: '1953' 
        },
        { 
          id: 'l12', 
          type: 'multiple-choice', 
          question: 'The museum building was originally used for what purpose?', 
          options: ['a town hall', 'a primary school', 'a textile mill'], 
          correctAnswer: 'a textile mill' 
        },
        { 
          id: 'l13', 
          type: 'multiple-choice', 
          question: 'What is currently the most popular exhibition in the museum?', 
          options: ['The Steam Engine', 'The Roman Coins', 'The Victorian Kitchen'], 
          correctAnswer: 'The Steam Engine' 
        },
        { id: 'l14', type: 'short-answer', question: 'The museum is closed on _______ every week.', correctAnswer: 'Monday' },
        { id: 'l15', type: 'short-answer', question: 'Children under _______ years of age can enter for free.', correctAnswer: '5' },
        { id: 'l16', type: 'short-answer', question: 'Visitors can buy local crafts and books at the _______.', correctAnswer: 'gift shop' },
        { id: 'l17', type: 'short-answer', question: 'The newly constructed art gallery was funded by a local _______.', correctAnswer: 'businessman' },
        { id: 'l18', type: 'short-answer', question: 'The daily guided museum tour starts at _______ AM.', correctAnswer: '10' },
        { id: 'l19', type: 'short-answer', question: 'Free vehicle parking is located directly behind the municipal _______.', correctAnswer: 'library' },
        { id: 'l20', type: 'short-answer', question: 'Standard photography is permitted except inside the temporary _______ room.', correctAnswer: 'exhibition' },

        // Section 3: Student Discussion on The Secret Garden (21-30)
        { id: 'l21', type: 'short-answer', question: 'Novel:', correctAnswer: 'The Secret Garden' },
        { id: 'l22', type: 'short-answer', question: 'Time period:', correctAnswer: 'twentieth century' },
        { id: 'l23', type: 'short-answer', question: 'Plot:', correctAnswer: 'walk' },
        { id: 'l24', type: 'short-answer', question: 'Point of view:', correctAnswer: 'motivations' },
        { id: 'l25', type: 'short-answer', question: 'Symbols:', correctAnswer: 'abstract ideas' },
        { id: 'l26', type: 'short-answer', question: 'Symbols detail:', correctAnswer: 'roses' },
        { id: 'l27', type: 'short-answer', question: 'Motifs detail:', correctAnswer: 'darkness to lightness' },
        { id: 'l28', type: 'short-answer', question: 'Themes detail 1:', correctAnswer: 'health' },
        { id: 'l29', type: 'short-answer', question: 'Themes detail 2:', correctAnswer: 'environment' },
        { id: 'l30', type: 'short-answer', question: 'Themes detail 3:', correctAnswer: 'human companionship' },

        // Section 4: Academic Lecture on Time Perspectives (31-40)
        { id: 'l31', type: 'short-answer', question: 'Past Outlook (Negative):', correctAnswer: 'negative' },
        { id: 'l32', type: 'short-answer', question: 'Present Hedonistic (Live for...):', correctAnswer: 'pleasure' },
        { id: 'l33', type: 'short-answer', question: 'Present Fatalistic (Governed by...):', correctAnswer: 'poverty' },
        { id: 'l34', type: 'short-answer', question: 'Future Outlook (Active):', correctAnswer: 'active' },
        { id: 'l35', type: 'short-answer', question: 'Future Fatalistic (Importance of...):', correctAnswer: 'virtue' },
        { 
          id: 'l36', 
          type: 'multiple-choice', 
          question: 'We are all present hedonists...', 
          options: ['at school', 'at birth', 'while eating and drinking'], 
          correctAnswer: 'at birth' 
        },
        { 
          id: 'l37', 
          type: 'multiple-choice', 
          question: 'American boys drop out of school at a higher rate than girls because:', 
          options: [
            'they need to be in control of the way they learn', 
            'they play video games instead of doing school work', 
            'they are not as intelligent as girls'
          ], 
          correctAnswer: 'they need to be in control of the way they learn' 
        },
        { 
          id: 'l38', 
          type: 'multiple-choice', 
          question: 'Present-orientated children:', 
          options: [
            'do not realise present actions can have negative future effects', 
            'are unable to learn lessons from past mistakes', 
            'know what could happen if they do something bad, but do it anyway'
          ], 
          correctAnswer: 'know what could happen if they do something bad, but do it anyway' 
        },
        { 
          id: 'l39', 
          type: 'multiple-choice', 
          question: 'If Americans had an extra day per week, they would spend it:', 
          options: ['working harder', 'building relationships', 'sharing family meals'], 
          correctAnswer: 'working harder' 
        },
        { 
          id: 'l40', 
          type: 'multiple-choice', 
          question: 'Understanding how people think about time can help us:', 
          options: ['become more virtuous', 'work together better', 'identify careless or ambitious people'], 
          correctAnswer: 'work together better' 
        }
      ]
    });

    // 2. Create Reading Questions (40 questions based on 3 passages)
    console.log("Creating Reading questions...");
    const readingQuestions = await Questions.create({
      testType: 'reading',
      title: 'Academic IELTS Reading Practice Test 1',
      forPlanType: 'free',
      isPublic: true,
      instructions: 'Do the following statements agree with the information given in the Reading Passages? Write TRUE, FALSE or NOT GIVEN. For multiple-choice questions, choose the correct letter A, B or C.',
      passages: [
        {
          title: 'Electroreception',
          content: `
<p class="mb-4"><strong>A</strong> Open your eyes in sea water and it is difficult to see much more than a murky, bleary green colour. Sounds, too, are garbled and difficult to comprehend. Without specialised equipment humans would be lost in these deep sea habitats, so how do fish make it seem so easy? Much of this is due to a biological phenomenon known as electroreception – the ability to perceive and act upon electrical stimuli as part of the overall senses. This ability is only found in aquatic or amphibian species because water is an efficient conductor of electricity. Air is a poor conductor, which explains why terrestrial creatures have not developed this sensory system.</p>
<p class="mb-4"><strong>B</strong> Electroreception comes in two variants. While all animals (including humans) generate weak electric signals, because they are emitted by the nervous system, some animals have the ability – known as passive electroreception – to receive and decode electric signals generated by other animals in order to sense their location. A passive electroreceptor does not send out any signals of its own; it merely acts as a receiver. This allows predators to detect prey hiding under sand or in darkness by tuning into the faint electrical impulses produced by the prey's heartbeats and muscle contractions.</p>
<p class="mb-4"><strong>C</strong> Other creatures possess active electroreception. These species have specialized bodily organs that generate special electric signals on cue. Active electroreceptors can detect distortions in the self-generated electric field caused by nearby objects, enabling the animal to navigate murky waters. Furthermore, this system is widely used for social communication, functioning as mating signals and territorial displays. In this way, active electroreception is essential for helping fish reproduce and coordinate social behaviors.</p>
<p class="mb-4"><strong>D</strong> One fascinating aspect of active electroreception is the Jamming Avoidance Response. Weakly electric fish, such as species of Gymnotiformes, rely on electric fields to sense their surroundings. However, if two fish using the same frequency meet, their signals can interfere with one another. To prevent their electroreception faculties from becoming jammed, the fish will shift their individual discharge frequencies. By doing so, they ensure they are transmitting on different frequencies, avoiding disruption.</p>
<p class="mb-4"><strong>E</strong> There is also evidence that electroreception plays a crucial role in animal defense. For instance, young ray embryos develop in egg cases attached to the sea bed. To breathe, the embryo keeps its tail in constant motion to pump water through the casing. However, when a predatory fish like a shark approaches, the embryo's electroreceptors detect the danger. To avoid detection, the embryo stops moving its tail and stops transmitting electric currents, remaining frozen and virtually invisible until the predator passes. The embryo has evolved to react specifically to signals characteristic of the respiratory movements of potential predators.</p>
<p class="mb-4"><strong>F</strong> Sharks are incredibly effective hunters that combine multiple senses. When seeking prey, a shark first locates its target using a keen sense of smell. Two-thirds of a shark’s brain is devoted entirely to its olfactory organs, making it highly sensitive to scents over long distances. However, as the shark enters the final stage of the attack, it switches from smell to electroreception, guiding its strikes with electrical accuracy. During these final few feet, the shark rolls its eyes back into its head for protection, relying entirely on its electroreceptive organs to complete the attack.</p>
<p class="mb-4"><strong>G</strong> Because sharks rely heavily on electroreception at close range, their interactions with humans are often misunderstood. Most shark attacks on humans are accidental. Sharks cannot use electroreception to determine if a human matches their dietary preferences; instead, they may deliver a test bite to evaluate the prey. Unfortunately, if a human is bleeding, the salt from the blood increases the conductivity of the water and heightens the electric fields, which can trigger a feeding frenzy. To improve beach safety, scientists have experimented with artificial electroreceptors that emit strong currents to repel sharks.</p>
<p class="mb-4"><strong>H</strong> While scientists have mapped out these behaviors, many aspects of electroreception remain poorly understood. We still do not fully comprehend the exact neurological processes that allow fish brains to encode and decode these complex signals. Additionally, researchers are investigating the role electroreception plays in long-distance migration. It is hypothesized that some creatures navigate across oceans by detecting the interaction between moving ocean currents and the magnetic fields generated by the Earth's core, translating them into electrical navigation cues.</p>
          `.trim()
        },
        {
          title: 'The Threat of Ocean Microplastics',
          content: `
<p class="mb-4">Microplastics, defined as plastic particles smaller than five millimeters, have become a pervasive environmental threat in marine ecosystems worldwide. These particles originate from two primary sources: primary microplastics, manufactured for commercial use like microbeads in cosmetics, and secondary microplastics, which result from the degradation of larger plastic debris like bags and bottles.</p>
<p class="mb-4">Due to their tiny size, microplastics are easily ingested by marine organisms, ranging from microscopic zooplankton to large filter-feeding whales. Once ingested, these plastics can cause physical damage, block digestive tracts, and release toxic chemical additives such as bisphenol A (BPA) and phthalates, which accumulate up the marine food chain.</p>
<p>Recent scientific studies have detected microplastics in deep ocean trenches and polar ice sheets, demonstrating the global scale of plastic pollution. Addressing this crisis requires strict regulation of plastic production, enhanced waste management systems, and a shift toward biodegradable alternatives to protect global marine health.</p>
          `.trim()
        },
        {
          title: 'Cognitive Biases in Decision Making',
          content: `
<p class="mb-4">Human beings like to think of themselves as rational decision-makers. However, decades of psychological research show that our judgment is systematically warped by cognitive biases—mental shortcuts that help us process information quickly but often lead to errors in logic. One of the most famous biases is confirmation bias, where individuals actively seek out information that supports their pre-existing beliefs while ignoring contradictory evidence.</p>
<p class="mb-4">Another common shortcut is the availability heuristic, where people judge the likelihood of an event based on how easily examples of it come to mind. For instance, after seeing news coverage of a plane crash, people often overestimate the danger of flying, ignoring statistical evidence that shows commercial aviation is incredibly safe.</p>
<p>Finally, the anchoring bias describes our tendency to rely too heavily on the first piece of information we receive when making decisions. In negotiations, the initial price offered sets a powerful 'anchor' that heavily influences all subsequent offers. Recognizing these cognitive patterns is essential for improving critical thinking and policy-making.</p>
          `.trim()
        }
      ],
      passage: `
<article class="space-y-12">
  <section class="p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
    <h2 class="text-3xl font-black text-primary mb-4">Reading Passage 1: Electroreception</h2>
    <p class="mb-4"><strong>A</strong> Open your eyes in sea water and it is difficult to see much more than a murky, bleary green colour. Sounds, too, are garbled and difficult to comprehend. Without specialised equipment humans would be lost in these deep sea habitats, so how do fish make it seem so easy? Much of this is due to a biological phenomenon known as electroreception – the ability to perceive and act upon electrical stimuli as part of the overall senses. This ability is only found in aquatic or amphibian species because water is an efficient conductor of electricity. Air is a poor conductor, which explains why terrestrial creatures have not developed this sensory system.</p>
    <p class="mb-4"><strong>B</strong> Electroreception comes in two variants. While all animals (including humans) generate weak electric signals, because they are emitted by the nervous system, some animals have the ability – known as passive electroreception – to receive and decode electric signals generated by other animals in order to sense their location. A passive electroreceptor does not send out any signals of its own; it merely acts as a receiver. This allows predators to detect prey hiding under sand or in darkness by tuning into the faint electrical impulses produced by the prey's heartbeats and muscle contractions.</p>
    <p class="mb-4"><strong>C</strong> Other creatures possess active electroreception. These species have specialized bodily organs that generate special electric signals on cue. Active electroreceptors can detect distortions in the self-generated electric field caused by nearby objects, enabling the animal to navigate murky waters. Furthermore, this system is widely used for social communication, functioning as mating signals and territorial displays. In this way, active electroreception is essential for helping fish reproduce and coordinate social behaviors.</p>
    <p class="mb-4"><strong>D</strong> One fascinating aspect of active electroreception is the Jamming Avoidance Response. Weakly electric fish, such as species of Gymnotiformes, rely on electric fields to sense their surroundings. However, if two fish using the same frequency meet, their signals can interfere with one another. To prevent their electroreception faculties from becoming jammed, the fish will shift their individual discharge frequencies. By doing so, they ensure they are transmitting on different frequencies, avoiding disruption.</p>
    <p class="mb-4"><strong>E</strong> There is also evidence that electroreception plays a crucial role in animal defense. For instance, young ray embryos develop in egg cases attached to the sea bed. To breathe, the embryo keeps its tail in constant motion to pump water through the casing. However, when a predatory fish like a shark approaches, the embryo's electroreceptors detect the danger. To avoid detection, the embryo stops moving its tail and stops transmitting electric currents, remaining frozen and virtually invisible until the predator passes. The embryo has evolved to react specifically to signals characteristic of the respiratory movements of potential predators.</p>
    <p class="mb-4"><strong>F</strong> Sharks are incredibly effective hunters that combine multiple senses. When seeking prey, a shark first locates its target using a keen sense of smell. Two-thirds of a shark’s brain is devoted entirely to its olfactory organs, making it highly sensitive to scents over long distances. However, as the shark enters the final stage of the attack, it switches from smell to electroreception, guiding its strikes with electrical accuracy. During these final few feet, the shark rolls its eyes back into its head for protection, relying entirely on its electroreceptive organs to complete the attack.</p>
    <p class="mb-4"><strong>G</strong> Because sharks rely heavily on electroreception at close range, their interactions with humans are often misunderstood. Most shark attacks on humans are accidental. Sharks cannot use electroreception to determine if a human matches their dietary preferences; instead, they may deliver a test bite to evaluate the prey. Unfortunately, if a human is bleeding, the salt from the blood increases the conductivity of the water and heightens the electric fields, which can trigger a feeding frenzy. To improve beach safety, scientists have experimented with artificial electroreceptors that emit strong currents to repel sharks.</p>
    <p class="mb-4"><strong>H</strong> While scientists have mapped out these behaviors, many aspects of electroreception remain poorly understood. We still do not fully comprehend the exact neurological processes that allow fish brains to encode and decode these complex signals. Additionally, researchers are investigating the role electroreception plays in long-distance migration. It is hypothesized that some creatures navigate across oceans by detecting the interaction between moving ocean currents and the magnetic fields generated by the Earth's core, translating them into electrical navigation cues.</p>
  </section>

  <section class="p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
    <h2 class="text-3xl font-black text-primary mb-4">Reading Passage 2: The Threat of Ocean Microplastics</h2>
    <p class="mb-4">Microplastics, defined as plastic particles smaller than five millimeters, have become a pervasive environmental threat in marine ecosystems worldwide. These particles originate from two primary sources: primary microplastics, manufactured for commercial use like microbeads in cosmetics, and secondary microplastics, which result from the degradation of larger plastic debris like bags and bottles.</p>
    <p class="mb-4">Due to their tiny size, microplastics are easily ingested by marine organisms, ranging from microscopic zooplankton to large filter-feeding whales. Once ingested, these plastics can cause physical damage, block digestive tracts, and release toxic chemical additives such as bisphenol A (BPA) and phthalates, which accumulate up the marine food chain.</p>
    <p>Recent scientific studies have detected microplastics in deep ocean trenches and polar ice sheets, demonstrating the global scale of plastic pollution. Addressing this crisis requires strict regulation of plastic production, enhanced waste management systems, and a shift toward biodegradable alternatives to protect global marine health.</p>
  </section>

  <section class="p-8 bg-primary/5 rounded-[2rem] border border-primary/10">
    <h2 class="text-3xl font-black text-primary mb-4">Reading Passage 3: Cognitive Biases in Decision Making</h2>
    <p class="mb-4">Human beings like to think of themselves as rational decision-makers. However, decades of psychological research show that our judgment is systematically warped by cognitive biases—mental shortcuts that help us process information quickly but often lead to errors in logic. One of the most famous biases is confirmation bias, where individuals actively seek out information that supports their pre-existing beliefs while ignoring contradictory evidence.</p>
    <p class="mb-4">Another common shortcut is the availability heuristic, where people judge the likelihood of an event based on how easily examples of it come to mind. For instance, after seeing news coverage of a plane crash, people often overestimate the danger of flying, ignoring statistical evidence that shows commercial aviation is incredibly safe.</p>
    <p>Finally, the anchoring bias describes our tendency to rely too heavily on the first piece of information we receive when making decisions. In negotiations, the initial price offered sets a powerful 'anchor' that heavily influences all subsequent offers. Recognizing these cognitive patterns is essential for improving critical thinking and policy-making.</p>
  </section>
</article>
      `,
      questions: [
        // Passage 1: Questions 1 to 13
        { id: 'r1', type: 'short-answer', question: 'how electroreception can be used to help fish reproduce', correctAnswer: 'C', passageIndex: 0 },
        { id: 'r2', type: 'short-answer', question: 'a possible use for electroreception that will benefit humans', correctAnswer: 'G', passageIndex: 0 },
        { id: 'r3', type: 'short-answer', question: 'the term for the capacity which enables an animal to pick up but not send out electrical signals', correctAnswer: 'B', passageIndex: 0 },
        { id: 'r4', type: 'short-answer', question: 'why only creatures that live in or near water have electroreceptive abilities', correctAnswer: 'A', passageIndex: 0 },
        { id: 'r5', type: 'short-answer', question: 'how electroreception might help creatures find their way over long distances', correctAnswer: 'H', passageIndex: 0 },
        { id: 'r6', type: 'short-answer', question: 'a description of how some fish can avoid disrupting each other\'s electric signals', correctAnswer: 'D', passageIndex: 0 },
        { id: 'r7', type: 'short-answer', question: 'Shark\'s 7 ................. alert the young ray to its presence', correctAnswer: 'respiratory movements', passageIndex: 0 },
        { id: 'r8', type: 'short-answer', question: 'Embryo moves its 8 ................. in order to breathe', correctAnswer: 'tail', passageIndex: 0 },
        { id: 'r9', type: 'short-answer', question: 'Embryo stops sending 9 ................. when predator close by', correctAnswer: 'electric currents', passageIndex: 0 },
        { id: 'r10', type: 'short-answer', question: 'A shark is a very effective hunter. Firstly, it uses its 10 ................. to smell its target.', correctAnswer: 'olfactory organs', passageIndex: 0 },
        { id: 'r11', type: 'short-answer', question: 'When the shark gets close, it uses 11 ................. to guide it toward an accurate attack.', correctAnswer: 'electroreception', passageIndex: 0 },
        { id: 'r12', type: 'short-answer', question: 'Within the final few feet the shark rolls its eyes back into its head. Humans are not popular food sources for most sharks due to their 12 .................', correctAnswer: 'dietary preferences', passageIndex: 0 },
        { id: 'r13', type: 'short-answer', question: 'Nevertheless, once a shark has bitten a human, a repeat attack is highly possible as salt from the blood increases the intensity of the 13 .................', correctAnswer: 'electric fields', passageIndex: 0 },

        // Passage 2: Questions 14 to 27
        { id: 'r14', type: 'true-false', question: 'Microplastics are defined as plastic particles larger than five millimeters.', correctAnswer: 'FALSE', passageIndex: 1 },
        { id: 'r15', type: 'true-false', question: 'Primary microplastics are intentionally manufactured for commercial products.', correctAnswer: 'TRUE', passageIndex: 1 },
        { id: 'r16', type: 'true-false', question: 'Secondary microplastics originate from the disintegration of larger waste plastic products.', correctAnswer: 'TRUE', passageIndex: 1 },
        { id: 'r17', type: 'true-false', question: 'Zooplankton are too small to ingest ocean microplastics.', correctAnswer: 'FALSE', passageIndex: 1 },
        { id: 'r18', type: 'true-false', question: 'BPA and phthalates are harmless chemicals added during plastic production.', correctAnswer: 'FALSE', passageIndex: 1 },
        { id: 'r19', type: 'true-false', question: 'Microplastics have been found in both polar regions and deep ocean trenches.', correctAnswer: 'TRUE', passageIndex: 1 },
        { id: 'r20', type: 'true-false', question: 'The total volume of ocean microplastics has decreased in the past decade.', correctAnswer: 'FALSE', passageIndex: 1 },
        { 
          id: 'r21', 
          type: 'multiple-choice', 
          question: 'Microplastics are defined as being less than which size?', 
          options: ['5 millimeters', '5 centimeters', '0.5 millimeters'], 
          correctAnswer: '5 millimeters',
          passageIndex: 1
        },
        { 
          id: 'r22', 
          type: 'multiple-choice', 
          question: 'Microbeads in cosmetics represent an example of...', 
          options: ['Secondary microplastics', 'Primary microplastics', 'Biodegradable fibers'], 
          correctAnswer: 'Primary microplastics',
          passageIndex: 1
        },
        { 
          id: 'r23', 
          type: 'multiple-choice', 
          question: 'Toxic chemical additives like BPA have been shown to...', 
          options: ['Disintegrate quickly in sea water', 'Bioaccumulate up the marine food web', 'Encourage coral growth rates'], 
          correctAnswer: 'Bioaccumulate up the marine food web',
          passageIndex: 1
        },
        { 
          id: 'r24', 
          type: 'multiple-choice', 
          question: 'Secondary microplastics are produced through the...', 
          options: ['Intentional manufacturing of industrial pellets', 'Gradual breakdown of larger plastic debris', 'Synthesis of chemical materials'], 
          correctAnswer: 'Gradual breakdown of larger plastic debris',
          passageIndex: 1
        },
        { 
          id: 'r25', 
          type: 'multiple-choice', 
          question: 'Which of these is mentioned as a filter-feeder that ingests microplastics?', 
          options: ['Zooplankton', 'Whales', 'Sharks'], 
          correctAnswer: 'Whales',
          passageIndex: 1
        },
        { 
          id: 'r26', 
          type: 'multiple-choice', 
          question: 'The presence of plastics in polar ice sheets demonstrates that microplastic pollution is...', 
          options: ['Localized to industrial ports', 'A global environmental issue', 'Declining in colder climates'], 
          correctAnswer: 'A global environmental issue',
          passageIndex: 1
        },
        { 
          id: 'r27', 
          type: 'multiple-choice', 
          question: 'What is proposed to combat microplastics in marine environments?', 
          options: ['Increasing plastic bag manufacturing', 'Transitioning to biodegradable alternative materials', 'Dumping plastic in deep trenches only'], 
          correctAnswer: 'Transitioning to biodegradable alternative materials',
          passageIndex: 1
        },

        // Passage 3: Questions 28 to 40
        { id: 'r28', type: 'true-false', question: 'Decades of research indicate humans are entirely rational decision-makers.', correctAnswer: 'FALSE', passageIndex: 2 },
        { id: 'r29', type: 'true-false', question: 'Confirmation bias leads people to ignore evidence that disputes their existing beliefs.', correctAnswer: 'TRUE', passageIndex: 2 },
        { id: 'r30', type: 'true-false', question: 'The availability heuristic relies on statistical data rather than direct memories.', correctAnswer: 'FALSE', passageIndex: 2 },
        { id: 'r31', type: 'true-false', question: 'Commercial aviation has been statistically proven to be highly secure.', correctAnswer: 'TRUE', passageIndex: 2 },
        { id: 'r32', type: 'true-false', question: 'Anchoring bias describes our tendency to focus heavily on the first information we receive.', correctAnswer: 'TRUE', passageIndex: 2 },
        { id: 'r33', type: 'true-false', question: 'In negotiations, the starting price offer has no impact on final outcomes.', correctAnswer: 'FALSE', passageIndex: 2 },
        { id: 'r34', type: 'true-false', question: 'Confirmation bias is a newly discovered shortcut found in 2020.', correctAnswer: 'FALSE', passageIndex: 2 },
        { 
          id: 'r35', 
          type: 'multiple-choice', 
          question: 'What are cognitive biases described as in the reading passage?', 
          options: ['Logical thinking strategies', 'Mental shortcuts that can cause logical errors', 'Advanced memory techniques'], 
          correctAnswer: 'Mental shortcuts that can cause logical errors',
          passageIndex: 2
        },
        { 
          id: 'r36', 
          type: 'multiple-choice', 
          question: 'An individual who only reads newspapers that support their political views displays...', 
          options: ['Anchoring bias', 'The availability heuristic', 'Confirmation bias'], 
          correctAnswer: 'Confirmation bias',
          passageIndex: 2
        },
        { 
          id: 'r37', 
          type: 'multiple-choice', 
          question: 'Why do some individuals overestimate the hazards associated with flying?', 
          options: ['Because flights are statistically extremely dangerous', 'Due to recent news coverages of plane crashes coming easily to mind', 'Because airplanes have no safety systems in place'], 
          correctAnswer: 'Due to recent news coverages of plane crashes coming easily to mind',
          passageIndex: 2
        },
        { 
          id: 'r38', 
          type: 'multiple-choice', 
          question: 'Which bias describes our heavy reliance on starting price numbers in bargaining?', 
          options: ['Anchoring bias', 'Confirmation bias', 'Availability bias'], 
          correctAnswer: 'Anchoring bias',
          passageIndex: 2
        },
        { 
          id: 'r39', 
          type: 'multiple-choice', 
          question: 'What is the main advantage of cognitive shortcuts?', 
          options: ['They always guarantee mathematically perfect decisions', 'They assist in processing information rapidly', 'They eliminate all forms of confirmation biases'], 
          correctAnswer: 'They assist in processing information rapidly',
          passageIndex: 2
        },
        { 
          id: 'r40', 
          type: 'multiple-choice', 
          question: 'Recognizing cognitive biases is critical to enhance...', 
          options: ['Speed reading capabilities', 'Critical thinking and public policy formulation', 'Bargaining and negotiating strategies'], 
          correctAnswer: 'Critical thinking and public policy formulation',
          passageIndex: 2
        }
      ]
    });

    // 3. Create Writing Questions (2 tasks)
    console.log("Creating Writing questions...");
    const writingQuestions = await Questions.create({
      testType: 'writing',
      title: 'Academic IELTS Writing Practice Test 1',
      forPlanType: 'free',
      isPublic: true,
      instructions: 'You should spend about 60 minutes on this entire test. Respond to both Writing Task 1 and Writing Task 2 inside the writing area, separating your answers clearly with headers (e.g. --- TASK 1 --- and --- TASK 2 ---).',
      passage: `
<div class="space-y-6">
  <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
    <h3 class="text-xl font-bold text-slate-800 mb-2">Task 1: Academic Report (Recommended: 20 minutes, minimum 150 words)</h3>
    <p class="mb-4 text-sm text-slate-600">The table below details global plastic production (in millions of tonnes) and the percentage of plastic recycled in four regions between 2000 and 2020.</p>
    
    <div class="overflow-x-auto my-4">
      <table class="table-auto w-full text-left border-collapse border border-slate-300 text-sm">
        <thead>
          <tr class="bg-slate-200">
            <th class="border border-slate-300 p-2">Region</th>
            <th class="border border-slate-300 p-2">2000 Prod. (Tonnes)</th>
            <th class="border border-slate-300 p-2">2000 Recycled %</th>
            <th class="border border-slate-300 p-2">2020 Prod. (Tonnes)</th>
            <th class="border border-slate-300 p-2">2020 Recycled %</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="border border-slate-300 p-2 font-bold">North America</td>
            <td class="border border-slate-300 p-2">85 million</td>
            <td class="border border-slate-300 p-2">8%</td>
            <td class="border border-slate-300 p-2">110 million</td>
            <td class="border border-slate-300 p-2">12%</td>
          </tr>
          <tr class="bg-slate-50">
            <td class="border border-slate-300 p-2 font-bold">European Union</td>
            <td class="border border-slate-300 p-2">70 million</td>
            <td class="border border-slate-300 p-2">12%</td>
            <td class="border border-slate-300 p-2">95 million</td>
            <td class="border border-slate-300 p-2">28%</td>
          </tr>
          <tr>
            <td class="border border-slate-300 p-2 font-bold">East Asia</td>
            <td class="border border-slate-300 p-2">110 million</td>
            <td class="border border-slate-300 p-2">5%</td>
            <td class="border border-slate-300 p-2">180 million</td>
            <td class="border border-slate-300 p-2">9%</td>
          </tr>
          <tr class="bg-slate-50">
            <td class="border border-slate-300 p-2 font-bold">Latin America</td>
            <td class="border border-slate-300 p-2">35 million</td>
            <td class="border border-slate-300 p-2">2%</td>
            <td class="border border-slate-300 p-2">55 million</td>
            <td class="border border-slate-300 p-2">4%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p class="text-sm text-slate-700 font-medium">Summarize the information by selecting and reporting the main features, and make comparisons where relevant.</p>
  </div>

  <div class="p-6 bg-slate-50 rounded-2xl border border-slate-200">
    <h3 class="text-xl font-bold text-slate-800 mb-2">Task 2: Opinion Essay (Recommended: 40 minutes, minimum 250 words)</h3>
    <p class="mb-4 text-slate-700 font-semibold">"Some people argue that university education should be completely free for all students, while others believe that students should pay for their tuition fees as it benefits the quality of education."</p>
    <p class="text-sm text-slate-600">Discuss both views and give your own opinion. Support your arguments with reasons and specific examples from your own knowledge or experience.</p>
  </div>
</div>
      `,
      questions: [
        { id: 'w1', type: 'short-answer', question: 'Task Responses:', correctAnswer: '[INSTRUCTOR REVIEW REQUIRED]' }
      ]
    });

    // 4. Create Speaking Questions (3 parts)
    console.log("Creating Speaking questions...");
    const speakingQuestions = await Questions.create({
      testType: 'speaking',
      title: 'Academic IELTS Speaking Practice Test 1',
      forPlanType: 'free',
      isPublic: true,
      question: 'Describe a book you have read recently that changed your mind about something.',
      passage: `• What the book was and who wrote it
• What topic or subject the book discussed
• What your opinion was before reading it
• And explain exactly how and why this book changed your mind.

--- IN-DEPTH DISCUSSION (PART 3) ---
After your Part 2 talk, the examiner will ask you abstract follow-up questions:
1. Do you think reading physical books is still important in the digital age? Why or why not?
2. How can schools encourage children to develop a habit of reading for pleasure?
3. Some people believe that non-fiction books are more valuable than fiction. To what extent do you agree?`,
      questions: [
        { id: 's1', type: 'short-answer', question: 'Speaking Recording Response:', correctAnswer: '[INSTRUCTOR REVIEW REQUIRED]' }
      ]
    });

    // 5. Create MockTest Container referencing the 4 questions sets
    console.log("Creating MockTest container...");
    const mockTest = await MockTest.create({
      title: 'IELTS Academic Real-World Mock Test 1',
      description: 'A complete, highly realistic IELTS Academic practice exam. Contains all 4 modules (Listening: 40 Qs, Reading: 40 Qs, Writing: 2 Tasks, Speaking: 3 Parts) conforming to standard IELTS timing and grading criteria.',
      planType: 'free',
      isPublic: true,
      totalDuration: 165, // 2 hours and 45 minutes
      sections: {
        listening: [listeningQuestions._id],
        reading: [readingQuestions._id],
        writing: [writingQuestions._id],
        speaking: [speakingQuestions._id]
      }
    });

    console.log("MockTest created successfully with ID:", mockTest._id);
    console.log("Listening Questions ID:", listeningQuestions._id);
    console.log("Reading Questions ID:", readingQuestions._id);
    console.log("Writing Questions ID:", writingQuestions._id);
    console.log("Speaking Questions ID:", speakingQuestions._id);
    
    mongoose.connection.close();
    console.log("Done! Database seed completed.");
  } catch (err) {
    console.error("Error during seeding:", err);
    process.exit(1);
  }
};

seed();
