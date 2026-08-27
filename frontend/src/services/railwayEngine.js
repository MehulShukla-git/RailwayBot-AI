// RailBot AI Domain Knowledge & Mock NLP Engine

const POPULAR_TRAINS = [
  {
    number: "20901",
    name: "Vande Bharat Express",
    route: "Mumbai Central (MMCT) ➔ Gandhinagar Capital (GDA)",
    departure: "06:00 AM",
    arrival: "12:25 PM",
    duration: "6h 25m",
    days: "Mon, Tue, Wed, Thu, Fri, Sat",
    status: "ON TIME",
    speed: "160 km/h (Peak)",
    classes: ["EC (Exec Chair)", "CC (Chair Car)"],
    availability: [
      { class: "CC", status: "AVAILABLE - 42 Seats", fare: "₹ 1,420" },
      { class: "EC", status: "AVAILABLE - 12 Seats", fare: "₹ 2,630" }
    ],
    stops: ["Borivali", "Vapi", "Surat", "Vadodara", "Ahmedabad"]
  },
  {
    number: "12951",
    name: "Mumbai Rajdhani Express",
    route: "Mumbai Central (MMCT) ➔ New Delhi (NDLS)",
    departure: "05:00 PM",
    arrival: "08:32 AM (Next Day)",
    duration: "15h 32m",
    days: "Daily",
    status: "ON TIME (Delayed by 5m)",
    speed: "130 km/h",
    classes: ["1A", "2A", "3A"],
    availability: [
      { class: "3A", status: "RAC 14", fare: "₹ 2,410" },
      { class: "2A", status: "AVAILABLE - 08 Seats", fare: "₹ 3,460" },
      { class: "1A", status: "AVAILABLE - 02 Seats", fare: "₹ 4,890" }
    ],
    stops: ["Surat", "Vadodara", "Ratlam", "Kota"]
  },
  {
    number: "12002",
    name: "Bhopal Shatabdi Express",
    route: "New Delhi (NDLS) ➔ Rani Kamlapati (RKMP)",
    departure: "06:00 AM",
    arrival: "02:40 PM",
    duration: "8h 40m",
    days: "Daily",
    status: "ON TIME",
    speed: "150 km/h",
    classes: ["EC", "CC"],
    availability: [
      { class: "CC", status: "AVAILABLE - 89 Seats", fare: "₹ 1,165" },
      { class: "EC", status: "AVAILABLE - 18 Seats", fare: "₹ 2,125" }
    ],
    stops: ["Mathura", "Agra Cantt", "Gwalior", "Jhansi"]
  },
  {
    number: "12639",
    name: "Brindavan Express",
    route: "Chennai Central (MAS) ➔ KSR Bengaluru (SBC)",
    departure: "07:40 AM",
    arrival: "02:00 PM",
    duration: "6h 20m",
    days: "Daily",
    status: "ON TIME",
    speed: "110 km/h",
    classes: ["CC", "2S"],
    availability: [
      { class: "2S", status: "AVAILABLE - 145 Seats", fare: "₹ 165" },
      { class: "CC", status: "AVAILABLE - 34 Seats", fare: "₹ 585" }
    ],
    stops: ["Arakkonam", "Katpadi", "Jolarpettai", "Bangarapet", "Bangalore Cantt"]
  }
];

const STATIONS = {
  NDLS: {
    code: "NDLS",
    name: "New Delhi Railway Station",
    platforms: 16,
    facilities: ["Executive Lounge", "24/7 Food Plaza", "Battery Car Service", "Free High-Speed Wi-Fi", "Cloak Room", "Retiring Rooms"],
    junction: true,
    zone: "Northern Railway (NR)",
    metroConnectivity: "Yellow Line & Airport Express Line",
    address: "Paharganj / Ajmeri Gate, New Delhi - 110055"
  },
  MMCT: {
    code: "MMCT",
    name: "Mumbai Central",
    platforms: 9,
    facilities: ["Pod Hotel (Urbanstation)", "AC Waiting Lounge", "IRCTC Food Court", "Escalators", "Free Wi-Fi"],
    junction: false,
    zone: "Western Railway (WR)",
    metroConnectivity: "Line 3 (Aqua Line) & Western Suburban Line",
    address: "Mumbai Central, Mumbai, Maharashtra - 400008"
  },
  HWH: {
    code: "HWH",
    name: "Howrah Junction",
    platforms: 23,
    facilities: ["Largest Railway Complex in India", "AC Lounge", "IRCTC Restaurant", "Ferry Ghat Transfer"],
    junction: true,
    zone: "Eastern Railway / South Eastern Railway",
    metroConnectivity: "Green Line (Under River Metro)",
    address: "Howrah, West Bengal - 711101"
  },
  SBC: {
    code: "SBC",
    name: "KSR Bengaluru City Junction",
    platforms: 10,
    facilities: ["Executive Lounge", "Battery Carts", "Subway Access to Metro", "Food Court"],
    junction: true,
    zone: "South Western Railway (SWR)",
    metroConnectivity: "Namma Metro Purple Line (Kranti Veera Sangolli Rayanna Station)",
    address: "Majestic, Bengaluru, Karnataka - 560023"
  },
  MAS: {
    code: "MAS",
    name: "Puratchi Thalaivar Dr. M.G. Ramachandran Central (Chennai Central)",
    platforms: 17,
    facilities: ["Heritage Building Lounge", "Air Conditioned Dormitories", "Multi-cuisine Food Plaza"],
    junction: true,
    zone: "Southern Railway (SR)",
    metroConnectivity: "Chennai Metro Blue & Green Interchanges",
    address: "Kannappar Thidal, Periyamet, Chennai, Tamil Nadu - 600003"
  }
};

export async function processRailwayQuery(query) {
  const q = query.toLowerCase().trim();

  // Simulate realistic network latency (400ms - 800ms)
  await new Promise(r => setTimeout(r, 600));

  // 1. Search Train Intent
  if (q.includes("search") || q.includes("find train") || q.includes("train between") || q.includes("available trains")) {
    let matchedTrains = POPULAR_TRAINS;
    if (q.includes("delhi") || q.includes("mumbai")) {
      matchedTrains = POPULAR_TRAINS.filter(t => t.number === "12951" || t.number === "20901");
    } else if (q.includes("bengaluru") || q.includes("chennai") || q.includes("bangalore")) {
      matchedTrains = POPULAR_TRAINS.filter(t => t.number === "12639");
    }

    return {
      type: "train_search",
      text: `Here are the top active train routes matching your enquiry:`,
      trains: matchedTrains
    };
  }

  // 2. Station Info Intent
  if (q.includes("station") || q.includes("platform") || q.includes("ndls") || q.includes("mmct") || q.includes("hwh") || q.includes("facility")) {
    let stationKey = "NDLS";
    if (q.includes("mumbai") || q.includes("mmct")) stationKey = "MMCT";
    else if (q.includes("howrah") || q.includes("hwh") || q.includes("kolkata")) stationKey = "HWH";
    else if (q.includes("bengaluru") || q.includes("bangalore") || q.includes("sbc")) stationKey = "SBC";
    else if (q.includes("chennai") || q.includes("mas")) stationKey = "MAS";

    const station = STATIONS[stationKey];
    return {
      type: "station_info",
      text: `Detailed Station Profile for **${station.name} (${station.code})**:`,
      station: station
    };
  }

  // 3. Schedule / Timetable Intent
  if (q.includes("schedule") || q.includes("timetable") || q.includes("time") || q.includes("arrival") || q.includes("departure")) {
    const train = POPULAR_TRAINS[0]; // Vande Bharat default or matched
    return {
      type: "train_schedule",
      text: `Official Schedule & Stoppages for **${train.name} (${train.number})**:`,
      schedule: {
        trainName: train.name,
        trainNumber: train.number,
        route: train.route,
        days: train.days,
        stops: [
          { station: "Mumbai Central (MMCT)", arr: "First Stn", dep: "06:00 AM", halt: "--", day: 1, dist: "0 km" },
          { station: "Borivali (BVI)", arr: "06:23 AM", dep: "06:25 AM", halt: "2m", day: 1, dist: "30 km" },
          { station: "Vapi (VAPI)", arr: "07:56 AM", dep: "07:58 AM", halt: "2m", day: 1, dist: "168 km" },
          { station: "Surat (ST)", arr: "08:55 AM", dep: "08:58 AM", halt: "3m", day: 1, dist: "263 km" },
          { station: "Vadodara Jn (BRC)", arr: "10:13 AM", dep: "10:18 AM", halt: "5m", day: 1, dist: "393 km" },
          { station: "Ahmedabad Jn (ADI)", arr: "11:25 AM", dep: "11:30 AM", halt: "5m", day: 1, dist: "493 km" },
          { station: "Gandhinagar Cap (GDA)", arr: "12:25 PM", dep: "Last Stn", halt: "--", day: 1, dist: "520 km" }
        ]
      }
    };
  }

  // 4. Train Details / PNR Status Intent
  if (q.includes("pnr") || q.includes("status") || q.includes("details") || q.includes("running status") || q.includes("live")) {
    return {
      type: "pnr_status",
      text: `Live Train Running Status & Booking Verification:`,
      pnrDetails: {
        pnr: "4820194852",
        train: "20901 - Vande Bharat Express",
        date: "Tomorrow (20 Aug 2026)",
        from: "Mumbai Central (MMCT)",
        to: "Ahmedabad Jn (ADI)",
        boarding: "Borivali (06:23 AM)",
        charting: "CHART NOT PREPARED",
        passengers: [
          { number: 1, booking: "CNF / CC / C4 / 21 (Window)", current: "CNF / CC / C4 / 21" },
          { number: 2, booking: "CNF / CC / C4 / 22 (Middle)", current: "CNF / CC / C4 / 22" }
        ]
      }
    };
  }

  // 5. Tatkal & Booking Rules
  if (q.includes("tatkal") || q.includes("timing") || q.includes("book")) {
    return {
      type: "text",
      text: `### 🕒 Indian Railways Tatkal Booking Timings:
- **AC Classes (1A, 2A, 3A, CC, EC)**: Opens daily at **10:00 AM** (1 day prior to journey date).
- **Non-AC Classes (SL, 2S, FC)**: Opens daily at **11:00 AM** (1 day prior to journey date).

💡 **Pro Tips for High Success Rate:**
1. Ensure your IRCTC e-Wallet is pre-funded or use UPI AutoPay.
2. Save passenger details in your IRCTC **Master List** before booking opens.
3. Login 5 minutes before booking time.`
    };
  }

  // 6. Luggage & Refund Rules
  if (q.includes("refund") || q.includes("cancellation") || q.includes("luggage")) {
    return {
      type: "text",
      text: `### 📋 IRCTC Ticket Cancellation & Refund Rules:
- **Flat Cancellation Charges (48+ Hours before departure):**
  - AC 1st Class / Executive Class: **₹240**
  - AC 2 Tier / First Class: **₹200**
  - AC 3 Tier / AC Chair Car: **₹180**
  - Sleeper Class: **₹120**
  - Second Class (2S): **₹60**
- **Chart Preparation**: If cancelled within 4 hours of departure or after chart prep, no refund is granted for confirmed tickets.`
    };
  }

  // General Railway AI Response
  return {
    type: "text",
    text: `I am **RailBot AI**, your intelligent Indian Railways assistant. 🚆

I can assist you with:
1. 🔍 **Searching Trains** between any source and destination station.
2. 🚉 **Station Info & Facilities** (Platforms, Lounges, Metro connections).
3. ⏱️ **Train Schedules & Timetables** with real-time stoppage information.
4. 🎟️ **PNR Status & Live Running Status** tracking.
5. 📜 **IRCTC Policies** (Tatkal timings, refund rules, senior citizen rules).

How can I help you plan your journey today?`
  };
}
