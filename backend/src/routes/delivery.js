import express from 'express';

const router = express.Router();

const deliveryZones = [
  {
    name: "Melbourne",
    postcodes: ["2567", "2570", "2557", "2556", "2565", "2167", "2611", "2617", "2564", "2560", "2566", "2179", "2558", "2559"],
    freeAbove: "$40",
    reducedCharge: "$1",
    belowRange: "$0 – $39.99",
    standardCharge: "$4.99",
    days: "Sunday to Friday",
    time: "4pm – 9pm",
    highlight: false,
  },
  {
    name: "Sydney",
    postcodes: ["2173", "2170", "2174", "2171"],
    freeAbove: "$50",
    reducedCharge: "$1",
    belowRange: "$0 – $49.99",
    standardCharge: "$4.99",
    days: "Sunday to Friday",
    time: "4pm – 9pm",
    highlight: false,
  },
  {
    name: "Brisbane",
    postcodes: ["2563"],
    freeAbove: "$50",
    reducedCharge: "$1",
    belowRange: "$0 – $49.99",
    standardCharge: "$5.99",
    days: "Sunday to Friday",
    time: "4pm – 9pm",
    highlight: false,
  },
  {
    name: "Adelaide",
    postcodes: ["2747", "2745", "2750", "2751", "2749"],
    freeAbove: "$75",
    reducedCharge: "$1",
    belowRange: "$0 – $74.99",
    standardCharge: "$5.99",
    days: "Saturdays",
    time: "12pm – 6pm",
  },
  {
    name: "Canberra",
    postcodes: ["2765", "2762", "2769", "2155", "2763", "2768", "2148"],
    freeAbove: "$75",
    reducedCharge: "$1",
    belowRange: "$0 – $74.99",
    standardCharge: "$5.99",
    days: "Saturdays",
    time: "12pm – 6pm",
  },
];

// GET /api/delivery/zone/:postcode
router.get('/zone/:postcode', (req, res) => {
  const clean = String(req.params.postcode || "").trim();
  if (!clean) return res.status(400).json({ message: 'Postcode required' });
  
  const zone = deliveryZones.find((z) => z.postcodes.includes(clean));
  res.json({ zone: zone || null });
});

export default router;
