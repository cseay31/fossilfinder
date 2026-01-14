import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { 
  X, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle, 
  BookOpen,
  HelpCircle,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const moduleContent = {
  "intro-archaeology": {
    sections: [
      {
        title: "What is Archaeology? (Part 1)",
        content: `Archaeology is the scientific study of human history and prehistory through the excavation and analysis of artifacts, structures, and other physical remains. It helps us understand how people lived in the past, from ancient civilizations to more recent history.

**The Scope of Archaeology:**
Archaeology covers an enormous time span - from the first stone tools made by our ancestors over 2.5 million years ago to objects from the recent past. Some archaeologists study dinosaurs (paleontology), while others focus on industrial-era factories or even modern garbage dumps!

**Archaeological Evidence Includes:**
• Artifacts (tools, pottery, jewelry, weapons, art)
• Ecofacts (environmental remains like seeds, pollen, bones, shells)
• Features (buildings, roads, burial sites, fire pits, post holes)
• Context (where and how items were found - this is crucial!)

**Why Context Matters:**
Finding a Roman coin is interesting. Finding it in a Viking grave tells a completely different story about trade, conquest, or cultural exchange. The location, depth, and surrounding materials of every find provide crucial information.

**The Archaeological Process:**
1. Survey - Finding sites through research, aerial photography, or walking the land
2. Excavation - Carefully digging and recording everything
3. Analysis - Studying artifacts in labs
4. Interpretation - Forming theories about past peoples
5. Publication - Sharing findings with the world

Archaeologists use various methods to date and analyze findings, including stratigraphy (study of layers), radiocarbon dating, and comparative analysis with known artifacts.`
      },
      {
        title: "What is Archaeology? (Part 2)",
        content: `**Subdisciplines of Archaeology:**

**Prehistoric Archaeology:**
Studies human societies before written records. This includes the Paleolithic (Old Stone Age), Mesolithic (Middle Stone Age), and Neolithic (New Stone Age) periods. Prehistoric archaeologists might study cave paintings, early tools, or the transition to agriculture.

**Historical Archaeology:**
Focuses on civilizations with written records, often combining archaeological evidence with historical documents. Examples include Roman forts, medieval castles, or Colonial American settlements.

**Underwater Archaeology:**
Studies submerged sites like shipwrecks, sunken cities, or flooded caves. Requires special diving skills and equipment. Famous discoveries include the Titanic and ancient Mediterranean shipwrecks.

**Bioarchaeology:**
Analyzes human and animal remains to understand health, diet, disease, and population movements. Can reveal information about violence, nutrition deficiencies, and life expectancy.

**Experimental Archaeology:**
Recreates ancient techniques to understand how things were made and used. This might involve making stone tools, building Roman roads, or firing ancient pottery designs.

**Cultural Resource Management (CRM):**
Archaeological work done before construction projects. Required by law in many places to preserve important sites. This is where most professional archaeologists work today!

**The Archaeological Record:**
Only a tiny fraction of past human activity becomes preserved. Organic materials like wood, leather, and textiles usually decay unless conditions are exceptional (very dry, very wet, frozen, or oxygen-free). This means archaeologists work with an incomplete picture and must be careful about drawing conclusions.`
      },
      {
        title: "Tools & Methods (Part 1: Field Work)",
        content: `Archaeologists use a variety of specialized tools and cutting-edge technology in their work:

**Basic Field Tools:**
• Trowels (flat, pointed) - The archaeologist's most important tool
• Brushes (various sizes) - For delicate cleaning
• Buckets and wheelbarrows - Moving excavated soil
• Screens/sieves (different mesh sizes) - Finding small artifacts
• Line levels and measuring tapes - Precise measurements
• Photography equipment with scales - Documentation
• Total Station or GPS - Precise 3D positioning
• Pencils and waterproof notebooks - Field notes

**Survey Equipment:**
• Transit or theodolite - Mapping elevations
• Metal detectors - Finding buried metal objects
• Soil probes - Testing depth of deposits
• Ranging poles and line - Marking boundaries
• Compasses - Orientation and mapping

**Documentation Tools:**
• Context sheets - Recording stratigraphic units
• Feature forms - Documenting structures
• Photo boards - Labeling images
• Drawing equipment - Plans and sections
• Bags and tags - Organizing finds

**The Grid System:**
Archaeologists typically divide sites into squares (often 5x5 meters or 2x2 meters). Each square is excavated separately and all finds are labeled with their grid coordinates. This creates a 3D map of where everything was found.

**Stratigraphic Excavation:**
Digging by layers (strata) rather than arbitrary depths. Newer layers on top, older below. Each layer represents a period of time - a flood, a building phase, an abandonment, etc. Understanding and recording these layers is fundamental to archaeology.`
      },
      {
        title: "Tools & Methods (Part 2: Lab & Technology)",
        content: `**Laboratory Analysis Tools:**

• Microscopes (stereoscopic, petrographic, SEM) - Examining tiny details, use-wear on tools, material composition
• Spectrometers - Identifying chemical composition of materials
• X-ray fluorescence (XRF) - Non-destructive elemental analysis
• CT scanners - 3D imaging without unwrapping mummies or opening containers
• DNA extraction equipment - Genetic analysis of remains
• Stable isotope analysis - Determining diet and migration patterns
• Residue analysis - Finding traces of food, drink, or other substances

**Modern Remote Sensing Technology:**

**Ground-Penetrating Radar (GPR):**
Sends radar pulses into the ground to map buried structures without excavation. Can detect walls, graves, and other features up to several meters deep.

**LiDAR (Light Detection and Ranging):**
Laser scanning from aircraft that penetrates forest canopy to reveal hidden structures. Revolutionary for finding Maya cities and other sites in dense vegetation.

**Aerial Photography & Satellite Imagery:**
Reveals crop marks, soil changes, and shadows that indicate buried structures. Historical aerial photos can show sites before modern development.

**Magnetometry:**
Detects magnetic variations in soil caused by ancient fires, iron objects, or disturbed earth. Can map entire sites quickly.

**Drones:**
Affordable aerial photography and mapping. Can create detailed 3D models of sites and track excavation progress.

**Geographic Information Systems (GIS):**
Computer mapping that layers different data types - site locations, terrain, water sources, ancient roads, etc. Helps understand settlement patterns and relationships between sites.

**3D Photogrammetry:**
Creating detailed 3D models from multiple photographs. Preserves sites digitally and allows remote study.

The key to archaeology is combining all these methods with careful, methodical work. Every item's location and context provides crucial information about the past. Technology helps us see and preserve more, but human interpretation remains essential.`
      },
      {
        title: "Career Paths (Part 1: Academic & Research)",
        content: `Archaeology offers diverse and exciting career opportunities across many sectors:

**Academic Archaeology:**

**University Professors:**
Teach courses, conduct research, publish findings, and supervise graduate students. Usually requires PhD and ongoing research. Combines teaching with fieldwork and analysis.

**Museum Curators:**
Manage collections, design exhibits, conduct research, and educate the public. May specialize in specific periods or types of artifacts. Work ranges from collections care to public programming.

**Museum Educators:**
Develop educational programs, lead tours, and create learning materials. Make archaeology accessible to diverse audiences. Often work with schools and community groups.

**Laboratory Specialists:**
Focus on specific analyses: ceramics, bones (zooarchaeology or bioarchaeology), ancient DNA, residue analysis, dating methods. Highly specialized scientific work.

**Research Archaeologists:**
Work for universities, museums, or research institutes. Design and conduct studies, publish in academic journals, present at conferences. May focus on theoretical development or specific research questions.

**Required Education for Academic Paths:**
• PhD usually required for university positions
• Master's degree minimum for most museum work
• Bachelor's degree with experience for some lab positions
• Ongoing research and publication essential
• Multiple field schools and specialized training

**Skills Needed:**
• Strong writing and communication
• Grant writing and fundraising
• Statistical and analytical thinking
• Patience and attention to detail
• Teaching ability
• Foreign language skills often helpful`
      },
      {
        title: "Career Paths (Part 2: Field & Applied)",
        content: `**Field Archaeology Careers:**

**Cultural Resource Management (CRM):**
The largest employer of archaeologists! CRM firms are hired before construction projects to survey for archaeological sites and excavate any that are found. Required by law in many countries.

Positions include:
• Field Technicians (entry-level, do the digging)
• Crew Chiefs (supervise small teams)
• Project Managers (oversee entire projects)
• Principal Investigators (senior archaeologists who write reports and run companies)

Work is often seasonal and involves travel. Physical demands but great hands-on experience.

**Government Archaeology:**
Federal, state, and local agencies employ archaeologists to:
• Manage archaeological resources on public lands
• Review development projects
• Maintain site databases
• Enforce protection laws
• Educate the public

More stable employment than CRM, often with benefits and regular hours.

**Specialized Archaeological Careers:**

**Underwater Archaeology:**
Requires diving certification plus archaeological training. Work on shipwrecks, submerged prehistoric sites, or harbor archaeology. Physically demanding but unique opportunities.

**Forensic Archaeology:**
Apply archaeological methods to crime scenes and mass disaster sites. Work with police, FBI, or international human rights organizations. Requires strong stomach and emotional resilience.

**Heritage Conservation:**
Preserve and stabilize archaeological sites and historic buildings. Combine archaeology with architecture and materials science. Work to prevent deterioration and damage.

**Archaeological Consulting:**
Independent contractors hired for specific expertise. May work internationally or specialize in particular periods or regions. Requires experience and established reputation.

**GIS and Remote Sensing Specialists:**
Focus on mapping and technological analysis. Highly sought after as technology becomes more important in archaeology.

The field combines outdoor fieldwork, laboratory analysis, and scholarly research, making it perfect for those who love history, science, and discovery!`
      }
    ],
    quiz: [
      {
        question: "What is the primary purpose of archaeology?",
        options: [
          "To collect valuable artifacts",
          "To study human history through physical remains",
          "To find buried treasure",
          "To prove historical theories"
        ],
        correctAnswer: 1
      },
      {
        question: "Which technology is commonly used for aerial archaeological surveys?",
        options: [
          "Microscopes",
          "Trowels",
          "LiDAR and drones",
          "Chemical analysis"
        ],
        correctAnswer: 2
      },
      {
        question: "What minimum education is typically required for professional archaeology positions?",
        options: [
          "High school diploma",
          "Bachelor's degree",
          "Master's degree",
          "PhD only"
        ],
        correctAnswer: 2
      }
    ]
  },
  "fossil-identification": {
    sections: [
      {
        title: "Types of Fossils (Part 1: Body Fossils)",
        content: `Fossils are the preserved remains or traces of ancient life, providing windows into Earth's biological history spanning over 3.5 billion years.

**Body Fossils - Preserved Remains:**

**Hard Parts (Most Common):**

**Bones and Teeth:**
Vertebrate fossils are the most recognizable. Bones are porous and readily absorb minerals during fossilization. Teeth are even more durable due to their enamel coating and are often the only parts of an animal that fossilize. Shark teeth are incredibly common fossils because sharks continuously replace teeth throughout their lives.

**Shells and Exoskeletons:**
Invertebrates like clams, snails, trilobites, and ammonites have hard outer shells that preserve exceptionally well. Their calcium carbonate or chitin shells can last millions of years. Marine environments are particularly good for shell preservation due to constant sediment deposition.

**Petrified Wood:**
Trees buried rapidly by volcanic ash or sediment can have their organic material replaced cell-by-cell with minerals (usually silica), preserving incredible detail. You can often see growth rings and even cellular structure in petrified wood.

**Soft Tissue (Extremely Rare):**
Under exceptional circumstances, soft tissue can preserve:
• Mummified dinosaurs with skin impressions
• Insects in amber with preserved muscle tissue
• Frozen mammoths with hair and organs
• Skin and feathers preserved in fine-grained sediment
• Permafrost preservation of ice age animals

**Conditions for Soft Tissue Preservation:**
• Rapid burial preventing decay
• Exclusion of oxygen
• Stable chemical environment
• Protection from scavengers
• Extreme cold or desiccation

Understanding the type of fossil helps determine its age, the organism it came from, and the environment in which it formed. Body fossils give us direct evidence of ancient organisms' anatomy and appearance.`
      },
      {
        title: "Types of Fossils (Part 2: Trace & Chemical)",
        content: `**Trace Fossils - Evidence of Behavior:**

Trace fossils (ichnofossils) don't preserve the organism itself, but evidence of its activities. These are incredibly valuable because they show behavior, not just anatomy!

**Footprints and Trackways:**
Preserved in soft sediment that later hardened. Can reveal:
• How the animal moved (bipedal vs quadrupedal)
• Speed of movement (stride length)
• Herding behavior (multiple trackways together)
• Hunting behavior (predator tracks near prey tracks)

Famous examples: Dinosaur tracks in Texas, ancient human footprints at Laetoli (Tanzania) - 3.6 million years old!

**Burrows and Borings:**
Tunnels made by worms, clams, or other organisms preserved in rock. Show where creatures lived and fed. Some trace fossils are so distinctive they're used to identify geological periods.

**Coprolites:**
Fossilized feces! Surprisingly useful - can be analyzed for:
• Diet (what the animal ate)
• Digestive system structure
• Parasites and diseases
• Climate and environment

**Other Trace Fossils:**
• Bite marks on bones (showing predation or scavenging)
• Scratch marks from feeding
• Egg nests and breeding sites
• Gastroliths (stomach stones from dinosaurs)
• Root traces from ancient plants

**Chemical Fossils (Molecular Evidence):**

**Biomarkers:**
Organic molecules that survive after the organism decays. Can identify:
• Type of organism that was present
• Environmental conditions
• Presence of ancient microbial life
• Even in rocks billions of years old

**Isotopic Signatures:**
Chemical fingerprints in rocks and fossils that reveal:
• Ancient temperatures
• Diet composition
• Migration patterns
• Ocean chemistry

**Oldest Evidence of Life:**
Chemical fossils push back evidence of life to over 3.5 billion years ago - long before any body fossils exist. These molecular signatures are our only evidence of Earth's earliest lifeforms.

Trace and chemical fossils complement body fossils by showing how organisms lived, moved, and interacted with their environment - information that bones alone cannot reveal.`
      },
      {
        title: "Dating Methods (Part 1: Relative Dating)",
        content: `Scientists use various methods to determine the age of fossils. Dating is crucial for understanding evolution, extinction events, and Earth's history.

**Relative Dating - Determining Age Order:**

Relative dating tells us which fossils are older or younger relative to each other, but not their exact age in years.

**Stratigraphy (Law of Superposition):**
In undisturbed sedimentary rock layers, older layers are below younger ones - like pages in a book. This fundamental principle allows us to build sequences of time.

Key concepts:
• Original horizontality - layers form horizontally
• Lateral continuity - layers extend in all directions
• Cross-cutting relationships - features that cut through layers are younger
• Unconformities - gaps in the rock record where erosion occurred

**Index Fossils:**
Certain organisms make excellent time markers because they:
• Lived for a relatively short geological time period
• Were widespread geographically
• Were abundant and easy to identify
• Had distinctive features

Examples:
• Trilobites for the Paleozoic Era
• Ammonites for the Mesozoic Era
• Specific foraminifera for dating ocean sediments

If you find the same index fossil in rocks from different locations, those rocks are likely the same age!

**Biostratigraphy:**
Using fossil assemblages (groups of fossils found together) to determine relative age. The combination of species present can pinpoint geological periods precisely.

**Correlation:**
Matching rock layers across different locations using:
• Index fossils
• Distinctive rock types
• Volcanic ash layers (can be dated absolutely)
• Magnetic reversals in rocks

**Faunal Succession:**
The principle that fossil organisms succeed each other in a definite, recognizable order. Once a species goes extinct, it never reappears - evolution doesn't run backward.

**Limitations:**
• Can't give absolute ages
• Requires good exposure of rock layers
• Can be complicated by faulting, folding, or erosion
• Some environments don't preserve fossils well`
      },
      {
        title: "Dating Methods (Part 2: Absolute Dating)",
        content: `**Absolute Dating - Determining Numerical Ages:**

Absolute dating provides actual ages in years (with error margins) using radioactive decay and other measurable processes.

**Radiocarbon Dating (C-14):**

**How it works:**
• Living organisms absorb Carbon-14 from the atmosphere
• When they die, C-14 starts to decay at a known rate
• Half-life of 5,730 years (half the C-14 is gone)
• Measuring remaining C-14 tells us how long since death

**Best for:**
• Organic materials (bone, wood, charcoal, shells)
• Ages up to about 50,000 years
• Archaeological sites and recent fossils

**Limitations:**
• Requires organic material
• Can be contaminated by modern carbon
• Plateaus in the calibration curve create uncertainty
• Cannot date older materials

**Potassium-Argon (K-Ar) Dating:**

**How it works:**
• Potassium-40 decays to Argon-40
• Half-life of 1.3 billion years
• Used on volcanic rocks
• Dates when the rock cooled and formed

**Best for:**
• Dating volcanic layers above/below fossils
• Hominid evolution sites (like in East Africa)
• Ages from 100,000 years to billions of years

**Example:**
The famous "Lucy" skeleton (Australopithecus) was dated by K-Ar dating of volcanic ash layers above and below the bones - 3.2 million years old.

**Uranium-Lead (U-Pb) Dating:**

**How it works:**
• Uranium-238 decays through multiple steps to Lead-206
• Half-life of 4.5 billion years
• Extremely accurate and reliable
• Can cross-check using different uranium isotopes

**Best for:**
• Very old rocks
• Zircon crystals (resist weathering, great for dating)
• Determining age of Earth (4.54 billion years)

**Other Absolute Dating Methods:**

**Thermoluminescence (TL):**
Measures trapped electrons in crystals. Used for pottery, burned flint, and sediments. Particularly useful when organic material is absent.

**Electron Spin Resonance (ESR):**
Similar to TL but doesn't destroy the sample. Good for tooth enamel and coral. Can date from thousands to millions of years.

**Amino Acid Racemization:**
Measures changes in amino acids after death. Temperature-dependent, so needs calibration. Used for bone and shell.

**Dendrochronology (Tree Rings):**
Counting and matching tree ring patterns. Incredibly precise - can date to the exact year! Useful for calibrating radiocarbon dates. Works back about 12,000 years.

Combining multiple dating methods provides the most accurate age estimates. Context is crucial - knowing the geological layer and associated materials helps confirm dates.`
      },
      {
        title: "Fossilization Process & Preservation (Part 1)",
        content: `**The Fossilization Process:**

Fossilization is incredibly rare! It's estimated that less than 0.1% of all organisms that ever lived became fossils. Here's why and how it happens:

**Steps to Fossilization:**

**1. Death and Deposition:**
The organism must die in or be transported to an environment where burial is likely. Quick burial is essential - every moment exposed increases chances of destruction by scavengers, weathering, or decay.

**2. Decay Resistance:**
Hard parts (shells, bones, teeth) resist decay better than soft tissue. Bacteria and decomposers quickly break down organic matter unless:
• Oxygen is excluded (underwater, rapid burial)
• Temperature is extreme (frozen, very hot)
• Chemical conditions prevent decay (high acidity or alkalinity)

**3. Burial:**
Sediment must cover the remains. Best environments:
• River deltas and floodplains (rapid sand/mud deposition)
• Lake bottoms (fine sediment, low oxygen)
• Ocean floors (constant sediment rain)
• Volcanic ash falls (sudden, complete burial)
• Tar pits (bones sink and are sealed)
• Amber (tree resin traps insects)
• Peat bogs (acidic, oxygen-free water)

**4. Mineralization:**
Over thousands to millions of years:

**Permineralization:**
Mineral-rich groundwater seeps through buried bones/wood. Minerals (usually silica, calcite, or pyrite) precipitate into the tiny spaces in the organic tissue. The original structure is preserved in mineral form.

**Replacement:**
The original material dissolves away and is replaced by minerals, molecule by molecule. The shape is preserved but the original material is gone. Can preserve incredibly fine details.

**Recrystallization:**
Original minerals (like calcium carbonate in shells) reorganize into larger, more stable crystals. The shell is still there but has changed form.

**Carbonization:**
Heat and pressure drive off other elements, leaving only a thin carbon film. Common for plants, leaves, and soft-bodied animals. Creates beautiful impressions but loses 3D structure.`
      },
      {
        title: "Fossilization Process & Preservation (Part 2)",
        content: `Fossil preservation requires specific conditions:

**Key Factors for Fossilization:**

• **Rapid burial** - The faster burial occurs, the better. Prevents scavenging, decay, and physical destruction. Catastrophic events (landslides, floods, volcanic eruptions) create ideal conditions.

• **Low oxygen environment** - Oxygen enables aerobic bacteria that decompose organic matter. Anoxic (oxygen-free) environments like deep ocean floors or lake bottoms slow decomposition dramatically.

• **Presence of minerals** - Groundwater must carry dissolved minerals for permineralization. Different minerals create different fossil types - silica makes beautiful agate and jasper fossils.

• **Stable conditions over millions of years** - The rocks containing fossils must avoid being melted, crushed, or eroded away. This is why most fossils are in sedimentary rocks, not igneous or highly metamorphic rocks.

• **Lack of disturbance** - Burrowing animals, plant roots, and geological activity can destroy fossils. Stable burial environments are crucial.

**Best Preservation Environments:**

**Lake beds and ocean floors:**
Fine sediment, low oxygen, stable conditions. Excellent for preserving delicate features and mass death assemblages.

**River deltas and floodplains:**
Rapid burial during floods. Good for large vertebrates and plants. Can create bonebeds with hundreds of specimens.

**Volcanic ash deposits:**
Sudden burial, fine particles preserve incredible detail. Famous examples: Pompeii (humans), Ashfall Fossil Beds (rhinos).

**Tar pits:**
Natural asphalt seeps trap animals. La Brea Tar Pits in California has thousands of ice age mammals including saber-toothed cats and dire wolves.

**Amber:**
Tree resin traps and perfectly preserves insects, spiders, small vertebrates, and plant material. Can preserve DNA and soft tissue. Oldest is 320 million years old!

**Ice and permafrost:**
Freezing prevents all decay. Can preserve DNA, soft tissue, hair, even stomach contents. Woolly mammoths, saber-toothed cats, and ancient humans found frozen.

**Peat bogs:**
Acidic, oxygen-free water tans skin like leather. "Bog bodies" preserve with skin, hair, and organs intact. Some over 2,000 years old with identifiable last meals!

**What Gets Preserved:**

Hard parts preserve best: bones, teeth, shells, wood. However, exceptional preservation (Lagerstätten) can capture:
• Skin impressions and color patterns
• Feathers, fur, and scales
• Internal organs and blood vessels
• Embryos inside eggs
• Last meals in digestive systems
• Soft-bodied organisms (jellyfish, worms)

**Key Factors:**
• Rapid burial (prevents decay and scavenging)
• Low oxygen environment (slows decomposition)
• Presence of minerals for replacement
• Stable conditions over millions of years

**Best Preservation Environments:**
• Lake beds and ocean floors
• River deltas and floodplains
• Volcanic ash deposits
• Tar pits and bogs
• Amber and ice

**What Gets Preserved:**
Hard parts (bones, shells) preserve better than soft tissue. However, exceptional preservation can capture:
• Skin impressions
• Feathers and fur
• Internal organs
• Last meals in digestive systems

**Modern Fossil Collection:**
• Document exact location (GPS coordinates)
• Photograph in situ (original position)
• Protect during extraction (plaster jackets)
• Properly catalog and store
• Report significant finds to authorities

Remember: In many places, fossil collection requires permits, and significant discoveries should be reported to scientific institutions.`
      }
    ],
    quiz: [
      {
        question: "What are trace fossils?",
        options: [
          "Fossils preserved in amber",
          "Footprints, burrows, and other evidence of activity",
          "Microscopic fossils",
          "Partially preserved bones"
        ],
        correctAnswer: 1
      },
      {
        question: "Which dating method is best for fossils up to 50,000 years old?",
        options: [
          "Uranium-Lead dating",
          "Potassium-Argon dating",
          "Radiocarbon dating",
          "Stratigraphy"
        ],
        correctAnswer: 2
      },
      {
        question: "What is the most important factor for fossil preservation?",
        options: [
          "High oxygen environment",
          "Rapid burial and low oxygen",
          "Extreme heat",
          "Direct sunlight exposure"
        ],
        correctAnswer: 1
      }
    ]
  },
  "excavation-techniques": {
    sections: [
      {
        title: "Site Survey",
        content: `Before excavation begins, archaeologists conduct thorough site surveys:

**Initial Survey Methods:**
• Desktop research (historical records, maps, aerial photos)
• Field walking (systematic surface collection)
• Remote sensing (magnetometry, ground-penetrating radar)
• Test pits and shovel test units

**Site Mapping:**
• Establish datum point (reference marker)
• Create grid system for precise location recording
• Topographic mapping
• GPS coordinates for all features

**Assessment:**
• Determine site boundaries
• Identify areas of interest
• Assess preservation state
• Plan excavation strategy

**Permissions and Permits:**
• Land owner permission
• Archaeological permits from authorities
• Environmental impact assessments
• Indigenous consultation (when applicable)

A good survey saves time, protects the site, and ensures important areas aren't missed.`
      },
      {
        title: "Digging Methods",
        content: `Archaeological excavation is precise, methodical work:

**Basic Principles:**
• Excavate by stratigraphic layers (not arbitrary depths)
• Remove most recent layers first
• Preserve context (3D position of all finds)
• Screen all excavated soil

**Tools and Techniques:**
• Trowels for careful scraping
• Brushes for delicate cleaning
• Buckets and wheelbarrows for soil removal
• Screens (1/4 inch mesh) for artifact recovery
• Dental tools for fine work

**Documentation:**
• Photographs at every stage
• Written notes and forms
• Scale drawings of profiles and plans
• Level measurements
• Artifact bags with context information

**Special Techniques:**
• Flotation (recovering tiny organic remains)
• Block lifting (removing fragile items with surrounding soil)
• Plaster jacketing (protecting fossils during removal)

**The Harris Matrix:**
A diagram showing the stratigraphic sequence - which layers formed when and their relationships. This is crucial for understanding the site's history.

Remember: Excavation destroys context, so documentation must be perfect. You can't go back!`
      },
      {
        title: "Documentation",
        content: `Proper documentation is the archaeologist's most important task:

**Why Documentation Matters:**
Once excavated, a site can never be restored. Documentation is the permanent record that allows future researchers to understand what was found and where.

**Recording System:**
• Context sheets for each stratigraphic unit
• Feature forms for structures and deposits
• Find sheets for artifacts
• Sample logs for environmental remains
• Photo logs with scales and north arrows

**Photography:**
• Overviews and details
• Before, during, and after excavation
• Include scales and information boards
• Multiple angles of features
• Close-ups of important finds

**Plans and Sections:**
• Top-down plans at regular intervals
• Section drawings showing stratigraphy
• Elevation drawings of features
• Scale drawings (usually 1:10 or 1:20)

**Digital Records:**
• GIS mapping
• 3D photogrammetry models
• Database entry
• Cloud backup of all data

**Laboratory Processing:**
• Washing and marking artifacts
• Cataloging in database
• Conservation when needed
• Storage in stable conditions

Good documentation enables:
• Future research and reinterpretation
• Publication and sharing findings
• Heritage management
• Public education

The goal is to create a comprehensive archive that tells the complete story of the site.`
      }
    ],
    quiz: [
      {
        question: "Why do archaeologists excavate by stratigraphic layers?",
        options: [
          "It's faster than other methods",
          "To preserve the chronological sequence of deposits",
          "It requires fewer tools",
          "To find artifacts more easily"
        ],
        correctAnswer: 1
      },
      {
        question: "What is a Harris Matrix?",
        options: [
          "A tool for measuring artifacts",
          "A diagram showing stratigraphic relationships",
          "A type of excavation grid",
          "A computer database system"
        ],
        correctAnswer: 1
      },
      {
        question: "Why is archaeological documentation so important?",
        options: [
          "To impress other archaeologists",
          "Because excavation destroys context permanently",
          "To publish papers quickly",
          "To sell artifacts later"
        ],
        correctAnswer: 1
      }
    ]
  },
  "ancient-civilizations": {
    sections: [
      {
        title: "Ancient Egypt",
        content: `Ancient Egypt thrived along the Nile River from ~3100 BCE to 30 BCE:

**Key Periods:**
• Old Kingdom (2686-2181 BCE) - Age of the Pyramids
• Middle Kingdom (2055-1650 BCE) - Classical period
• New Kingdom (1550-1077 BCE) - Imperial expansion
• Late Period (664-332 BCE) - Foreign rule

**Major Achievements:**
• Pyramids of Giza (last surviving ancient wonder)
• Hieroglyphic writing system
• Advanced mathematics and astronomy
• Sophisticated medical knowledge
• Elaborate religious practices and afterlife beliefs

**Archaeological Sites:**
• Valley of the Kings (royal tombs)
• Karnak and Luxor Temples
• Abu Simbel
• Alexandria (ancient library)

**Famous Discoveries:**
• Tutankhamun's tomb (Howard Carter, 1922)
• Rosetta Stone (key to deciphering hieroglyphs)
• Royal mummies
• Papyrus scrolls

Egyptian archaeology continues to reveal new discoveries, including recently found tombs and lost cities.`
      },
      {
        title: "Mesopotamia & Rome",
        content: `**MESOPOTAMIA (3500-539 BCE):**
"The Cradle of Civilization" between the Tigris and Euphrates rivers.

Major Civilizations:
• Sumerians - Invented writing (cuneiform), wheel, plow
• Akkadians - First empire under Sargon
• Babylonians - Hammurabi's Code of Law
• Assyrians - Powerful military empire
• Persians - Vast multicultural empire

Key Sites:
• Ur - City with ziggurat and royal tombs
• Babylon - Hanging Gardens (lost wonder)
• Nineveh - Assyrian capital with vast library

---

**ANCIENT ROME (753 BCE - 476 CE):**
From small city-state to empire spanning three continents.

Major Periods:
• Kingdom (753-509 BCE)
• Republic (509-27 BCE) - Expansion across Mediterranean
• Empire (27 BCE-476 CE) - Peak power and influence

Engineering Marvels:
• Aqueducts bringing fresh water
• Roads connecting the empire
• Colosseum and amphitheaters
• Concrete construction techniques
• Public baths and sanitation

Famous Sites:
• Pompeii and Herculaneum (preserved by Vesuvius eruption)
• Roman Forum
• Pantheon (still standing with original dome)
• Hadrian's Wall
• Catacombs

Roman archaeology provides insights into daily life, from graffiti in Pompeii to luxury villas.`
      },
      {
        title: "Maya Civilization",
        content: `The Maya civilization flourished in Mesoamerica from ~2000 BCE to Spanish conquest:

**Geographic Range:**
• Southern Mexico (Yucatan Peninsula)
• Guatemala
• Belize
• Honduras
• El Salvador

**Major Achievements:**
• Sophisticated calendar systems
• Complex hieroglyphic writing
• Advanced mathematics (concept of zero)
• Impressive architectural monuments
• Accurate astronomical observations

**Classic Period (250-900 CE):**
The height of Maya civilization with great cities:
• Tikal - Massive pyramids and temples
• Palenque - Ornate architecture and inscriptions
• Copán - Hieroglyphic stairway
• Calakmul - Major political power

**Post-Classic Period (900-1500 CE):**
• Chichen Itza - Pyramid of Kukulkan
• Mayapan - Last great Maya capital
• Uxmal - Governor's Palace

**Archaeological Insights:**
• Ball game courts (ritual sport)
• Elaborate burial practices for rulers
• Trade networks across Mesoamerica
• Complex political systems and warfare
• Agricultural techniques (raised fields, terracing)

**Mystery of the "Collapse":**
Around 900 CE, many southern cities were abandoned. Theories include:
• Drought and climate change
• Overpopulation and resource depletion
• Warfare and political upheaval
• Combination of factors

The Maya civilization didn't disappear - millions of Maya people still live in the region today, maintaining cultural traditions.

**Modern Discoveries:**
LiDAR technology has revealed thousands of previously unknown Maya structures hidden beneath jungle canopy, dramatically changing our understanding of Maya population and complexity.`
      }
    ],
    quiz: [
      {
        question: "What was the primary innovation of ancient Sumerians?",
        options: [
          "The pyramid",
          "Writing (cuneiform)",
          "Democracy",
          "Iron weapons"
        ],
        correctAnswer: 1
      },
      {
        question: "Which Roman city was preserved by a volcanic eruption?",
        options: [
          "Rome",
          "Athens",
          "Pompeii",
          "Carthage"
        ],
        correctAnswer: 2
      },
      {
        question: "What technology has recently revolutionized Maya archaeology?",
        options: [
          "Radiocarbon dating",
          "DNA analysis",
          "LiDAR scanning",
          "Satellite imagery"
        ],
        correctAnswer: 2
      }
    ]
  }
};

export default function ModuleViewer({ module, onClose, onComplete }) {
  const [currentSection, setCurrentSection] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const content = moduleContent[module.id];
  const totalSections = content.sections.length;
  const progress = ((currentSection + 1) / totalSections) * 100;

  const handleNext = () => {
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setShowQuiz(true);
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleQuizSubmit = () => {
    let correct = 0;
    content.quiz.forEach((question, index) => {
      if (quizAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setQuizScore(correct);
    setQuizSubmitted(true);

    // If passed (75% or higher), mark as complete
    if (correct >= content.quiz.length * 0.75) {
      onComplete();
    }
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">{module.title}</h2>
            {!showQuiz && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Section {currentSection + 1} of {totalSections}: {content.sections[currentSection].title}</span>
                  <span>{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}
            {showQuiz && !quizSubmitted && (
              <p className="text-slate-600">Complete the quiz to finish this module (75% required to pass)</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="ml-4">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {!showQuiz ? (
              <motion.div
                key={currentSection}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <BookOpen className="w-6 h-6 text-blue-600" />
                      {content.sections[currentSection].title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-slate max-w-none">
                      {content.sections[currentSection].content.split('\n').map((paragraph, idx) => {
                        if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                          return <h3 key={idx} className="text-lg font-semibold text-slate-800 mt-4 mb-2">{paragraph.slice(2, -2)}</h3>;
                        } else if (paragraph.startsWith('•')) {
                          return <li key={idx} className="ml-4 text-slate-700">{paragraph.slice(2)}</li>;
                        } else if (paragraph.trim()) {
                          return <p key={idx} className="text-slate-700 mb-3">{paragraph}</p>;
                        }
                        return null;
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {!quizSubmitted ? (
                  <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-0">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <HelpCircle className="w-6 h-6 text-amber-600" />
                        Knowledge Check
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {content.quiz.map((question, qIndex) => (
                        <div key={qIndex} className="bg-white rounded-lg p-4 shadow-sm">
                          <p className="font-medium text-slate-800 mb-4">
                            {qIndex + 1}. {question.question}
                          </p>
                          <RadioGroup
                            value={quizAnswers[qIndex]?.toString()}
                            onValueChange={(value) => setQuizAnswers({ ...quizAnswers, [qIndex]: parseInt(value) })}
                          >
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="flex items-center space-x-2 mb-2">
                                <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                                <Label htmlFor={`q${qIndex}-o${oIndex}`} className="cursor-pointer">
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ) : (
                  <Card className={`${quizScore >= content.quiz.length * 0.75 ? 'bg-gradient-to-br from-green-50 to-emerald-50' : 'bg-gradient-to-br from-red-50 to-orange-50'} border-0`}>
                    <CardHeader className="text-center">
                      <div className={`w-20 h-20 rounded-full ${quizScore >= content.quiz.length * 0.75 ? 'bg-green-500' : 'bg-orange-500'} flex items-center justify-center mx-auto mb-4`}>
                        {quizScore >= content.quiz.length * 0.75 ? (
                          <Award className="w-10 h-10 text-white" />
                        ) : (
                          <HelpCircle className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <CardTitle className="text-2xl">
                        {quizScore >= content.quiz.length * 0.75 ? 'Congratulations!' : 'Keep Learning!'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-center space-y-4">
                      <p className="text-lg text-slate-700">
                        You scored <span className="font-bold text-2xl">{quizScore}</span> out of <span className="font-bold text-2xl">{content.quiz.length}</span>
                      </p>
                      <p className="text-slate-600">
                        {quizScore >= content.quiz.length * 0.75 
                          ? "You've successfully completed this module! Your knowledge has been certified."
                          : "You need at least 75% to pass. Review the material and try again!"}
                      </p>
                      <div className="space-y-3">
                        {content.quiz.map((question, qIndex) => {
                          const isCorrect = quizAnswers[qIndex] === question.correctAnswer;
                          return (
                            <div key={qIndex} className={`p-3 rounded-lg ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                              <div className="flex items-start gap-2">
                                {isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                ) : (
                                  <X className="w-5 h-5 text-red-600 mt-0.5" />
                                )}
                                <div className="flex-1 text-left">
                                  <p className="font-medium text-slate-800">{question.question}</p>
                                  {!isCorrect && (
                                    <p className="text-sm text-slate-600 mt-1">
                                      Correct answer: {question.options[question.correctAnswer]}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {quizScore < content.quiz.length * 0.75 && (
                        <Button
                          onClick={handleRetakeQuiz}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          Review & Retake Quiz
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-6 rounded-b-xl flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentSection === 0 || showQuiz}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {!showQuiz && (
            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
            >
              {currentSection === totalSections - 1 ? 'Take Quiz' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}

          {showQuiz && !quizSubmitted && (
            <Button
              onClick={handleQuizSubmit}
              disabled={Object.keys(quizAnswers).length < content.quiz.length}
              className="bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800"
            >
              Submit Quiz
              <CheckCircle className="w-4 h-4 ml-2" />
            </Button>
          )}

          {quizSubmitted && (
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800"
            >
              {quizScore >= content.quiz.length * 0.75 ? 'Complete Module' : 'Close'}
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}