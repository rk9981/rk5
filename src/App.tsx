/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

interface ExcavationPitItem {
  id: number;
  label: string;
  count: number;
  length: number; // in meters
  width: number;  // in meters
  depth: number;  // in meters
  extra: number;  // margin %
}

interface FootingItem {
  id: number;
  label: string;
  count: number;
  length: number;    // in meters
  width: number;     // in meters
  thickness: number; // in meters
}

interface ColumnItem {
  id: number;
  label: string;
  count: number;
  width: number;  // in meters (e.g. 0.23m = 230mm)
  depth: number;  // in meters (e.g. 0.23m = 230mm)
  height: number; // in meters (e.g. 3.0m)
}

interface SlabItem {
  id: number;
  label: string;
  count: number;     // number of slabs / floors
  length: number;    // in meters
  width: number;     // in meters
  thickness: number; // in meters (e.g. 0.125m = 125mm)
}

interface DoorItem {
  id: number;
  label: string;
  count: number;
  width: number;  // in meters
  height: number; // in meters
}

interface WindowItem {
  id: number;
  label: string;
  count: number;
  width: number;  // in meters
  height: number; // in meters
}

interface VentilatorItem {
  id: number;
  label: string;
  count: number;
  width: number;  // in meters
  height: number; // in meters
}

interface RoomItem {
  id: number;
  type: string;
  l: number; // in meters
  w: number; // in meters
  n: number;
}

interface UserAccount {
  name: string;
  password: string;
}

export default function App() {
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');

  // Login form state
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Register form state
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');
  const [regConfirm, setRegConfirm] = useState<string>('');
  const [regError, setRegError] = useState<string>('');
  const [regSuccess, setRegSuccess] = useState<string>('');

  // Stepper state (0 to 8)
  // 0: Project, 1: Excavation, 2: Footings, 3: Columns, 4: Beams & Slabs, 5: Walls & Rooms, 6: Openings, 7: Finishing, 8: Rates
  const [currentStep, setCurrentStep] = useState<number>(0);

  // Step 1: Project Details (Metric)
  const [project, setProject] = useState<string>('');
  const [buildingType, setBuildingType] = useState<string>('Residential');
  const [floors, setFloors] = useState<number>(1);
  const [plotL, setPlotL] = useState<number>(12); // meters
  const [plotW, setPlotW] = useState<number>(9);  // meters
  const [area, setArea] = useState<number>(95);   // sq. meters per floor

  // Step 2: Excavation (Dedicated Option)
  const [excavationPits, setExcavationPits] = useState<ExcavationPitItem[]>([
    {
      id: 1,
      label: 'Main Column Pits (P1)',
      count: 10,
      length: 1.5, // m
      width: 1.5,  // m
      depth: 1.5,  // m
      extra: 10,   // %
    },
  ]);
  const [nextPitId, setNextPitId] = useState<number>(2);

  // Additional Foundation Trench Excavation
  const [trenchLength, setTrenchLength] = useState<number>(0); // m
  const [trenchWidth, setTrenchWidth] = useState<number>(0.45); // m
  const [trenchDepth, setTrenchDepth] = useState<number>(0.6); // m

  // Step 3: Footings (Dedicated Option)
  const [footings, setFootings] = useState<FootingItem[]>([
    {
      id: 1,
      label: 'Footing Type 1 (F1)',
      count: 10,
      length: 1.2,    // m
      width: 1.2,     // m
      thickness: 0.35 // m
    },
  ]);
  const [nextFootingId, setNextFootingId] = useState<number>(2);

  // Step 4: Columns (Dedicated Option)
  const [columns, setColumns] = useState<ColumnItem[]>([
    {
      id: 1,
      label: 'Column Type 1 (C1)',
      count: 10,
      width: 0.23, // m (230 mm / 9")
      depth: 0.23, // m (230 mm / 9")
      height: 3.0, // m (~10 ft)
    },
  ]);
  const [nextColId, setNextColId] = useState<number>(2);

  // Step 5: RCC Superstructure (Beams & Slab Dimensions)
  const [beamLength, setBeamLength] = useState<number>(50); // running meters
  const [beamW, setBeamW] = useState<number>(0.23); // meters
  const [beamD, setBeamD] = useState<number>(0.30); // meters

  // Dedicated Slab Dimensions panels
  const [slabs, setSlabs] = useState<SlabItem[]>([
    {
      id: 1,
      label: 'Main Floor / Roof Slab',
      count: 1,
      length: 10.0,   // meters
      width: 9.5,     // meters
      thickness: 0.125, // meters (125 mm)
    },
  ]);
  const [nextSlabId, setNextSlabId] = useState<number>(2);

  const [mixC, setMixC] = useState<number>(1);
  const [mixS, setMixS] = useState<number>(2);
  const [mixA, setMixA] = useState<number>(4);
  const [steelFactor, setSteelFactor] = useState<number>(100); // kg / m³ RCC
  const [miscRcc, setMiscRcc] = useState<number>(0); // m³

  // Step 6: Walls & Rooms
  const [rooms, setRooms] = useState<RoomItem[]>([
    { id: 1, type: 'Bedroom', l: 3.6, w: 3.6, n: 2 },
    { id: 2, type: 'Living / Hall', l: 4.5, w: 3.6, n: 1 },
    { id: 3, type: 'Kitchen', l: 3.0, w: 2.4, n: 1 },
    { id: 4, type: 'Bathroom', l: 2.4, w: 1.5, n: 2 },
  ]);
  const [nextRoomId, setNextRoomId] = useState<number>(5);

  const [wallLength, setWallLength] = useState<number>(45); // running meters / floor
  const [wallHeight, setWallHeight] = useState<number>(3.0); // meters
  const [wallThick, setWallThick] = useState<number>(0.23); // meters (230 mm)
  const [mortarC, setMortarC] = useState<number>(1);
  const [mortarS, setMortarS] = useState<number>(6);
  const [brickFactor, setBrickFactor] = useState<number>(500); // bricks per cu.m of brickwork

  // Step 7: Openings - Separate Dedicated Options for Doors, Windows, and Ventilation
  const [doorsList, setDoorsList] = useState<DoorItem[]>([
    { id: 1, label: 'Main Entrance Door (D1)', count: 1, width: 1.2, height: 2.1 },
    { id: 2, label: 'Room Doors (D2)', count: 4, width: 0.9, height: 2.1 },
    { id: 3, label: 'Bathroom / Toilet Doors (D3)', count: 2, width: 0.75, height: 2.1 },
  ]);
  const [nextDoorId, setNextDoorId] = useState<number>(4);

  const [windowsList, setWindowsList] = useState<WindowItem[]>([
    { id: 1, label: 'Living Room Window (W1)', count: 2, width: 1.5, height: 1.2 },
    { id: 2, label: 'Bedroom Windows (W2)', count: 3, width: 1.2, height: 1.2 },
    { id: 3, label: 'Kitchen Window (W3)', count: 1, width: 0.9, height: 0.9 },
  ]);
  const [nextWindowId, setNextWindowId] = useState<number>(4);

  const [ventsList, setVentsList] = useState<VentilatorItem[]>([
    { id: 1, label: 'Bathroom Ventilators (V1)', count: 2, width: 0.6, height: 0.45 },
    { id: 2, label: 'Kitchen / Store Vent (V2)', count: 1, width: 0.6, height: 0.45 },
  ]);
  const [nextVentId, setNextVentId] = useState<number>(3);

  // Step 8: Finishing, Tiles, Electrical & Plumbing
  const [floorArea, setFloorArea] = useState<number>(0); // sq.m (0 = auto from slab area)
  const [wallTilesArea, setWallTilesArea] = useState<number>(25); // sq.m for bathroom & kitchen wall dado tiles
  const [plasterSides, setPlasterSides] = useState<number>(2); // 1 or 2
  const [plasterThick, setPlasterThick] = useState<number>(12); // mm
  const [paintCoats, setPaintCoats] = useState<number>(2);
  const [electricalPoints, setElectricalPoints] = useState<number>(25);
  const [plumbingFixtures, setPlumbingFixtures] = useState<number>(10);
  const [waterproofArea, setWaterproofArea] = useState<number>(10); // sq.m

  // Step 9: Material & Labour Rates (in Metric Units)
  // Structural & Core materials
  const [cementRate, setCementRate] = useState<number>(380); // ₹ / 50kg bag
  const [sandRate, setSandRate] = useState<number>(1900); // ₹ / cu.m
  const [aggRate, setAggRate] = useState<number>(1750); // ₹ / cu.m
  const [steelRate, setSteelRate] = useState<number>(65); // ₹ / kg
  const [brickRate, setBrickRate] = useState<number>(8); // ₹ / piece
  const [excRate, setExcRate] = useState<number>(400); // ₹ / cu.m
  const [shutteringRate, setShutteringRate] = useState<number>(450); // ₹ / sq.m of slab formwork
  const [labourRate, setLabourRate] = useState<number>(2700); // ₹ / sq.m built-up

  // Openings rates (Directly matching Doors, Windows, and Vents options)
  const [doorRate, setDoorRate] = useState<number>(6500); // ₹ / door (frame + shutter + hardware)
  const [windowRate, setWindowRate] = useState<number>(4500); // ₹ / window (frame + glass + grill)
  const [ventRate, setVentRate] = useState<number>(1500); // ₹ / ventilator

  // Tiles & Finishing rates (Directly matching Tiles options)
  const [floorRate, setFloorRate] = useState<number>(950); // ₹ / sq.m (Floor Tiles + Laying)
  const [wallTilesRate, setWallTilesRate] = useState<number>(850); // ₹ / sq.m (Bathroom/Kitchen Wall Dado Tiles)
  const [plasterRate, setPlasterRate] = useState<number>(380); // ₹ / sq.m
  const [paintRate, setPaintRate] = useState<number>(270); // ₹ / sq.m
  const [electricalRate, setElectricalRate] = useState<number>(700); // ₹ / point
  const [plumbingRate, setPlumbingRate] = useState<number>(1200); // ₹ / fixture
  const [waterproofRate, setWaterproofRate] = useState<number>(480); // ₹ / sq.m
  const [miscRate, setMiscRate] = useState<number>(0); // ₹ Lump sum
  const [wastage, setWastage] = useState<number>(5); // %
  const [contingency, setContingency] = useState<number>(3); // %

  // Results state
  const [showResult, setShowResult] = useState<boolean>(false);
  const [calcData, setCalcData] = useState<{
    totalArea: number;
    excavation: number;
    rccCft: number; // total RCC in cu.m
    wallVol: number; // wall brickwork in cu.m
    cement: number;  // bags
    sand: number;    // cu.m
    agg: number;     // cu.m
    steel: number;   // kg
    brickQty: number; // pieces
    plasterArea: number; // sq.m
    calcFloorArea: number; // sq.m
    calcWallTilesArea: number; // sq.m
    paintArea: number; // sq.m
    slabVolume: number; // cu.m
    slabFormworkArea: number; // sq.m
    openingsArea: number; // sq.m
    doorCount: number;
    windowCount: number;
    ventCount: number;
    items: [string, number, string, number][];
    contingencyVal: number;
    contingencyRate: number;
    grandTotal: number;
    costPerSqft: number; // cost per sq.m
    resultTitle: string;
  } | null>(null);

  // Load existing session on mount
  useEffect(() => {
    try {
      const email = sessionStorage.getItem('buildcost_logged_in');
      const savedUsersStr = localStorage.getItem('buildcost_users');
      const users: Record<string, UserAccount> = savedUsersStr ? JSON.parse(savedUsersStr) : {};
      if (email && users[email]) {
        setIsLoggedIn(true);
        setCurrentUser(users[email].name);
        setProject((prev) => (prev ? prev : users[email].name + "'s Building"));
      }
    } catch {
      // fallback
    }
  }, []);

  // Helper number formatters
  const fmt = (x: number) => {
    return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(x);
  };

  const money = (x: number) => {
    return '₹' + fmt(x);
  };

  // Auth Handlers
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const emailKey = loginEmail.trim().toLowerCase();
    try {
      const savedUsersStr = localStorage.getItem('buildcost_users');
      const users: Record<string, UserAccount> = savedUsersStr ? JSON.parse(savedUsersStr) : {};
      if (users[emailKey] && users[emailKey].password === loginPassword) {
        sessionStorage.setItem('buildcost_logged_in', emailKey);
        setIsLoggedIn(true);
        setCurrentUser(users[emailKey].name);
        if (!project) {
          setProject(users[emailKey].name + "'s Building");
        }
      } else {
        setLoginError('Invalid email or password. Please register or check your credentials.');
      }
    } catch {
      setLoginError('An error occurred during login. Please try again.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    const name = regName.trim();
    const emailKey = regEmail.trim().toLowerCase();

    if (!name || !emailKey) {
      setRegError('Please enter full name and a valid email address.');
      return;
    }
    if (regPassword.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regPassword !== regConfirm) {
      setRegError('Password and Confirm Password do not match.');
      return;
    }

    try {
      const savedUsersStr = localStorage.getItem('buildcost_users');
      const users: Record<string, UserAccount> = savedUsersStr ? JSON.parse(savedUsersStr) : {};

      if (users[emailKey]) {
        setRegError('This email is already registered. Please login.');
        return;
      }

      users[emailKey] = { name, password: regPassword };
      localStorage.setItem('buildcost_users', JSON.stringify(users));

      setLoginEmail(emailKey);
      setLoginPassword('');
      setAuthTab('login');
      alert('Registration successful! Please login with your email and password.');
    } catch {
      setRegError('Browser storage error. Please try again.');
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem('buildcost_logged_in');
    } catch {
      // ignore
    }
    setIsLoggedIn(false);
    setCurrentUser('');
    setLoginPassword('');
    setAuthTab('login');
  };

  // Add & Remove Excavation Pits
  const addExcavationPit = () => {
    const newId = nextPitId;
    setNextPitId(newId + 1);
    setExcavationPits([
      ...excavationPits,
      {
        id: newId,
        label: `Pit Type ${newId}`,
        count: 5,
        length: 1.5,
        width: 1.5,
        depth: 1.5,
        extra: 10,
      },
    ]);
  };

  const removeExcavationPit = (id: number) => {
    if (excavationPits.length <= 1) {
      alert('At least one Excavation Pit type is required.');
      return;
    }
    setExcavationPits(excavationPits.filter((p) => p.id !== id));
  };

  const updateExcavationPit = (id: number, field: keyof ExcavationPitItem, value: any) => {
    setExcavationPits(
      excavationPits.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  // Add & Remove Footings
  const addFooting = () => {
    const newId = nextFootingId;
    setNextFootingId(newId + 1);
    setFootings([
      ...footings,
      {
        id: newId,
        label: `Footing Type ${newId} (F${newId})`,
        count: 5,
        length: 1.2,
        width: 1.2,
        thickness: 0.35,
      },
    ]);
  };

  const removeFooting = (id: number) => {
    if (footings.length <= 1) {
      alert('At least one Footing type is required.');
      return;
    }
    setFootings(footings.filter((f) => f.id !== id));
  };

  const updateFooting = (id: number, field: keyof FootingItem, value: any) => {
    setFootings(
      footings.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  // Add & Remove Columns
  const addColumn = () => {
    const newId = nextColId;
    setNextColId(newId + 1);
    setColumns([
      ...columns,
      {
        id: newId,
        label: `Column Type ${newId} (C${newId})`,
        count: 5,
        width: 0.23,
        depth: 0.23,
        height: 3.0,
      },
    ]);
  };

  const removeColumn = (id: number) => {
    if (columns.length <= 1) {
      alert('At least one Column type is required.');
      return;
    }
    setColumns(columns.filter((c) => c.id !== id));
  };

  const updateColumn = (id: number, field: keyof ColumnItem, value: any) => {
    setColumns(
      columns.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  // Add & Remove Slab Panels
  const addSlab = () => {
    const newId = nextSlabId;
    setNextSlabId(newId + 1);
    setSlabs([
      ...slabs,
      {
        id: newId,
        label: `Slab Panel ${newId}`,
        count: 1,
        length: 4.0,
        width: 3.0,
        thickness: 0.125,
      },
    ]);
  };

  const removeSlab = (id: number) => {
    if (slabs.length <= 1) {
      alert('At least one Slab panel is required.');
      return;
    }
    setSlabs(slabs.filter((s) => s.id !== id));
  };

  const updateSlab = (id: number, field: keyof SlabItem, value: any) => {
    setSlabs(slabs.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const autoFillSlabFromArea = () => {
    const defaultLen = plotL > 0 ? Number(plotL) : 10;
    const defaultWid = plotW > 0 ? Number(plotW) : 9.5;
    setSlabs([
      {
        id: 1,
        label: `Full Built-up Slab (${floors} Floor${floors > 1 ? 's' : ''})`,
        count: Math.max(1, Number(floors) || 1),
        length: defaultLen,
        width: defaultWid,
        thickness: 0.125,
      },
    ]);
  };

  // Add & Remove Rooms
  const addRoom = () => {
    const newId = nextRoomId;
    setNextRoomId(newId + 1);
    setRooms([
      ...rooms,
      {
        id: newId,
        type: 'Bedroom',
        l: 3.6,
        w: 3.6,
        n: 1,
      },
    ]);
  };

  const removeRoom = (id: number) => {
    setRooms(rooms.filter((r) => r.id !== id));
  };

  const updateRoom = (id: number, field: keyof RoomItem, value: any) => {
    setRooms(rooms.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  };

  // Add & Remove Doors
  const addDoor = () => {
    const newId = nextDoorId;
    setNextDoorId(newId + 1);
    setDoorsList([
      ...doorsList,
      {
        id: newId,
        label: `Door Type ${newId} (D${newId})`,
        count: 1,
        width: 0.9,
        height: 2.1,
      },
    ]);
  };

  const removeDoor = (id: number) => {
    if (doorsList.length <= 1) {
      alert('At least one Door entry is required.');
      return;
    }
    setDoorsList(doorsList.filter((d) => d.id !== id));
  };

  const updateDoor = (id: number, field: keyof DoorItem, value: any) => {
    setDoorsList(doorsList.map((d) => (d.id === id ? { ...d, [field]: value } : d)));
  };

  // Add & Remove Windows
  const addWindow = () => {
    const newId = nextWindowId;
    setNextWindowId(newId + 1);
    setWindowsList([
      ...windowsList,
      {
        id: newId,
        label: `Window Type ${newId} (W${newId})`,
        count: 1,
        width: 1.2,
        height: 1.2,
      },
    ]);
  };

  const removeWindow = (id: number) => {
    if (windowsList.length <= 1) {
      alert('At least one Window entry is required.');
      return;
    }
    setWindowsList(windowsList.filter((w) => w.id !== id));
  };

  const updateWindow = (id: number, field: keyof WindowItem, value: any) => {
    setWindowsList(windowsList.map((w) => (w.id === id ? { ...w, [field]: value } : w)));
  };

  // Add & Remove Ventilators
  const addVentilator = () => {
    const newId = nextVentId;
    setNextVentId(newId + 1);
    setVentsList([
      ...ventsList,
      {
        id: newId,
        label: `Ventilator Type ${newId} (V${newId})`,
        count: 1,
        width: 0.6,
        height: 0.45,
      },
    ]);
  };

  const removeVentilator = (id: number) => {
    if (ventsList.length <= 1) {
      alert('At least one Ventilator entry is required.');
      return;
    }
    setVentsList(ventsList.filter((v) => v.id !== id));
  };

  const updateVentilator = (id: number, field: keyof VentilatorItem, value: any) => {
    setVentsList(ventsList.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  };

  // Stepper navigation
  const go = (step: number) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Live Calculations for current steps
  const totalExcavationVolume =
    excavationPits.reduce((sum, row) => {
      const q = Math.max(0, Number(row.count) || 0);
      const l = Math.max(0, Number(row.length) || 0);
      const w = Math.max(0, Number(row.width) || 0);
      const d = Math.max(0, Number(row.depth) || 0);
      const extra = Math.max(0, Number(row.extra) || 0);
      return sum + q * l * w * d * (1 + extra / 100);
    }, 0) +
    (Number(trenchLength) || 0) * (Number(trenchWidth) || 0) * (Number(trenchDepth) || 0);

  const totalFootingVolume = footings.reduce((sum, row) => {
    const q = Math.max(0, Number(row.count) || 0);
    const l = Math.max(0, Number(row.length) || 0);
    const w = Math.max(0, Number(row.width) || 0);
    const d = Math.max(0, Number(row.thickness) || 0);
    return sum + q * l * w * d;
  }, 0);

  const totalColumnVolume = columns.reduce((sum, row) => {
    const q = Math.max(0, Number(row.count) || 0);
    const w = Math.max(0, Number(row.width) || 0);
    const d = Math.max(0, Number(row.depth) || 0);
    const h = Math.max(0, Number(row.height) || 0);
    return sum + q * w * d * h;
  }, 0);

  const totalSlabVolume = slabs.reduce((sum, s) => {
    const q = Math.max(0, Number(s.count) || 0);
    const l = Math.max(0, Number(s.length) || 0);
    const w = Math.max(0, Number(s.width) || 0);
    const t = Math.max(0, Number(s.thickness) || 0);
    return sum + q * l * w * t;
  }, 0);

  const totalSlabArea = slabs.reduce((sum, s) => {
    const q = Math.max(0, Number(s.count) || 0);
    const l = Math.max(0, Number(s.length) || 0);
    const w = Math.max(0, Number(s.width) || 0);
    return sum + q * l * w;
  }, 0);

  // Live Openings Calculations
  const totalDoorArea = doorsList.reduce((sum, d) => {
    const q = Math.max(0, Number(d.count) || 0);
    const w = Math.max(0, Number(d.width) || 0);
    const h = Math.max(0, Number(d.height) || 0);
    return sum + q * w * h;
  }, 0);
  const totalDoorCount = doorsList.reduce((sum, d) => sum + (Number(d.count) || 0), 0);

  const totalWindowArea = windowsList.reduce((sum, w) => {
    const q = Math.max(0, Number(w.count) || 0);
    const width = Math.max(0, Number(w.width) || 0);
    const height = Math.max(0, Number(w.height) || 0);
    return sum + q * width * height;
  }, 0);
  const totalWindowCount = windowsList.reduce((sum, w) => sum + (Number(w.count) || 0), 0);

  const totalVentArea = ventsList.reduce((sum, v) => {
    const q = Math.max(0, Number(v.count) || 0);
    const width = Math.max(0, Number(v.width) || 0);
    const height = Math.max(0, Number(v.height) || 0);
    return sum + q * width * height;
  }, 0);
  const totalVentCount = ventsList.reduce((sum, v) => sum + (Number(v.count) || 0), 0);

  const totalOpeningsArea = totalDoorArea + totalWindowArea + totalVentArea;

  // Calculate full estimation in Metric
  const handleCalculate = () => {
    const fCount = Math.max(1, Number(floors) || 1);
    const builtArea = Number(area) || (Number(plotL) || 0) * (Number(plotW) || 0);
    const totalBuiltArea = builtArea * fCount;

    // Excavation (m³)
    const excavation = totalExcavationVolume;

    // Footing RCC (m³)
    const footing = totalFootingVolume;

    // Columns RCC (m³)
    const cols = totalColumnVolume;

    // Beams RCC (m³)
    const beams = (Number(beamLength) || 0) * (Number(beamW) || 0) * (Number(beamD) || 0);

    // Slab RCC (m³) - Calculated directly from user entered Slab Dimensions!
    const slabVol = totalSlabVolume > 0 ? totalSlabVolume : builtArea * 0.125;
    const slabFormwork = totalSlabArea > 0 ? totalSlabArea : totalBuiltArea;

    // Total RCC in m³
    const rccM3 = footing + cols + beams + slabVol + (Number(miscRcc) || 0);

    // Concrete Mix Materials
    const mC = Number(mixC) || 0;
    const mS = Number(mixS) || 0;
    const mA = Number(mixA) || 0;
    const mixTotal = mC + mS + mA;
    const rccDry = rccM3 * 1.54; // Dry volume factor

    // 1 bag of cement (50kg) = 0.03472 m³ (volume = mass / density ~ 50 / 1440 kg/m³)
    const cementVolRcc = mixTotal ? rccDry * (mC / mixTotal) : 0;
    const cementRccBags = cementVolRcc / 0.03472;
    const sandRcc = mixTotal ? rccDry * (mS / mixTotal) : 0; // m³
    const aggRcc = mixTotal ? rccDry * (mA / mixTotal) : 0;  // m³
    const steelKg = rccM3 * (Number(steelFactor) || 0);

    // Brickwork & Walls (m³) with Doors, Windows, and Vents deducted
    const grossWallArea = (Number(wallLength) || 0) * (Number(wallHeight) || 0) * fCount;
    const netWallArea = Math.max(0, grossWallArea - totalOpeningsArea);
    const wallVol = netWallArea * (Number(wallThick) || 0); // m³
    const bricks = wallVol * (Number(brickFactor) || 500); // 500 bricks / m³

    // Mortar for brickwork
    const mortarWet = wallVol * 0.30;
    const mortarDry = mortarWet * 1.33;
    const mortC = Number(mortarC) || 0;
    const mortS = Number(mortarS) || 0;
    const mt = mortC + mortS;
    const cementMortarVol = mt ? mortarDry * (mortC / mt) : 0;
    const cementMortarBags = cementMortarVol / 0.03472;
    const sandMortar = mt ? mortarDry * (mortS / mt) : 0; // m³

    // Flooring & Tiles
    const customFloorArea = Number(floorArea) || (totalSlabArea > 0 ? totalSlabArea : totalBuiltArea);
    const customWallTilesArea = Number(wallTilesArea) || 0;

    // Plastering
    const pSides = Number(plasterSides) || 2;
    const plasterArea = netWallArea * pSides; // sq.m
    const plasterVol = plasterArea * ((Number(plasterThick) || 12) / 1000); // m³
    const plasterDry = plasterVol * 1.33;
    const plasterCementVol = plasterDry * (1 / 5); // 1:4 or 1:5 plaster ratio
    const cementPlasterBags = plasterCementVol / 0.03472;
    const sandPlaster = plasterDry * (4 / 5); // m³
    const paintArea = plasterArea * (Number(paintCoats) || 0); // sq.m

    // Wastage Multiplier
    const wastageMultiplier = 1 + (Number(wastage) || 0) / 100;
    const cementTotalBags = (cementRccBags + cementMortarBags + cementPlasterBags) * wastageMultiplier;
    const sandTotal = (sandRcc + sandMortar + sandPlaster) * wastageMultiplier; // m³
    const aggTotal = aggRcc * wastageMultiplier; // m³
    const steelTotal = steelKg * wastageMultiplier; // kg
    const brickTotal = bricks * wastageMultiplier; // pieces

    // BOQ Item list in Metric Units with all option rates included
    const items: [string, number, string, number][] = [
      ['Cement', cementTotalBags, 'bags (50kg)', Number(cementRate) || 0],
      ['Sand', sandTotal, 'cu.m (m³)', Number(sandRate) || 0],
      ['Aggregate / Coarse Gravel', aggTotal, 'cu.m (m³)', Number(aggRate) || 0],
      ['Reinforcement Steel', steelTotal, 'kg', Number(steelRate) || 0],
      ['Bricks', brickTotal, 'pieces', Number(brickRate) || 0],
      ['Excavation', excavation, 'cu.m (m³)', Number(excRate) || 0],
      ['Slab & Beam Formwork (Shuttering & Scaffolding)', slabFormwork, 'sq.m', Number(shutteringRate) || 0],
      ['Structural Construction Labour', totalBuiltArea, 'sq.m', Number(labourRate) || 0],
      ['Doors (Frames, Shutters & Fitting)', totalDoorCount, 'doors', Number(doorRate) || 0],
      ['Windows (Frames, Glass & Safety Grills)', totalWindowCount, 'windows', Number(windowRate) || 0],
      ['Ventilators (Louvers, Glass & Exhaust Prov.)', totalVentCount, 'ventilators', Number(ventRate) || 0],
      ['Floor Tiles & Flooring (Vitrified/Ceramic + Laying)', customFloorArea, 'sq.m', Number(floorRate) || 0],
      ['Wall Dado Tiles (Bathrooms & Kitchens)', customWallTilesArea, 'sq.m', Number(wallTilesRate) || 0],
      ['Plastering', plasterArea, 'sq.m', Number(plasterRate) || 0],
      ['Painting (coat-area)', paintArea, 'sq.m', Number(paintRate) || 0],
      ['Electrical Points', Number(electricalPoints) || 0, 'points', Number(electricalRate) || 0],
      ['Plumbing Fixtures', Number(plumbingFixtures) || 0, 'fixtures', Number(plumbingRate) || 0],
      ['Waterproofing', Number(waterproofArea) || 0, 'sq.m', Number(waterproofRate) || 0],
      ['Miscellaneous / Site Expenses', 1, 'lump sum', Number(miscRate) || 0],
    ];

    let subtotal = 0;
    items.forEach(([, q, , r]) => {
      subtotal += q * r;
    });

    const contPercentage = Number(contingency) || 0;
    const contingencyAmount = (subtotal * contPercentage) / 100;
    const grandTotal = subtotal + contingencyAmount;
    const costPerSq = totalBuiltArea > 0 ? grandTotal / totalBuiltArea : 0;

    const resTitle = `${project || 'Your Project'} · ${buildingType} · ${fCount} Floor(s) · Metric Units`;

    setCalcData({
      totalArea: totalBuiltArea,
      excavation,
      rccCft: rccM3,
      wallVol,
      cement: cementTotalBags,
      sand: sandTotal,
      agg: aggTotal,
      steel: steelTotal,
      brickQty: brickTotal,
      plasterArea,
      calcFloorArea: customFloorArea,
      calcWallTilesArea: customWallTilesArea,
      paintArea,
      slabVolume: slabVol,
      slabFormworkArea: slabFormwork,
      openingsArea: totalOpeningsArea,
      doorCount: totalDoorCount,
      windowCount: totalWindowCount,
      ventCount: totalVentCount,
      items,
      contingencyVal: contingencyAmount,
      contingencyRate: contPercentage,
      grandTotal,
      costPerSqft: costPerSq,
      resultTitle: resTitle,
    });

    setShowResult(true);

    setTimeout(() => {
      const el = document.getElementById('result');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // If not logged in, show Auth Gate
  if (!isLoggedIn) {
    return (
      <section id="authGate">
        <div className="auth-shell">
          <div className="auth-top">
            <h1>
              🏢 BuildCost <span style={{ color: '#ffc24b' }}>Pro</span>
            </h1>
            <p>Building Construction Cost Estimator (Metric Units)</p>
          </div>
          <div className="auth-tabs">
            <button
              id="loginTab"
              className={authTab === 'login' ? 'active' : ''}
              type="button"
              onClick={() => setAuthTab('login')}
            >
              Login
            </button>
            <button
              id="registerTab"
              className={authTab === 'register' ? 'active' : ''}
              type="button"
              onClick={() => setAuthTab('register')}
            >
              Create New Account
            </button>
          </div>
          <div className="auth-content">
            {authTab === 'login' ? (
              <form className="auth-pane" id="loginForm" onSubmit={handleLogin}>
                <h2>User Login</h2>
                {loginError && (
                  <div className="auth-error" style={{ display: 'block' }}>
                    {loginError}
                  </div>
                )}
                <div className="auth-field">
                  <label>Email Address</label>
                  <input
                    id="loginEmail"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input
                    id="loginPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
                <button className="auth-submit" type="submit">
                  Login & Open Estimator →
                </button>
                <p className="auth-help">
                  New user? Click 'Create New Account' first, then log in using your registered credentials.
                </p>
              </form>
            ) : (
              <form className="auth-pane" id="registerForm" onSubmit={handleRegister}>
                <h2>Create New Account</h2>
                {regError && (
                  <div className="auth-error" style={{ display: 'block' }}>
                    {regError}
                  </div>
                )}
                {regSuccess && (
                  <div className="auth-success" style={{ display: 'block' }}>
                    {regSuccess}
                  </div>
                )}
                <div className="auth-field">
                  <label>Full Name</label>
                  <input
                    id="regName"
                    required
                    placeholder="Enter your full name"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label>Email Address</label>
                  <input
                    id="regEmail"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label>Password (minimum 6 characters)</label>
                  <input
                    id="regPassword"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create a password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                  />
                </div>
                <div className="auth-field">
                  <label>Confirm Password</label>
                  <input
                    id="regConfirm"
                    type="password"
                    required
                    minLength={6}
                    placeholder="Confirm your password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                  />
                </div>
                <button className="auth-submit register" type="submit">
                  Create Account / Register
                </button>
                <p className="auth-help">
                  Account details are safely preserved in browser storage for instant session access.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    );
  }

  // App Shell once logged in
  return (
    <div id="appShell" style={{ display: 'block' }}>
      <header className="hero">
        <div className="hero-in">
          <div className="brand">
            BUILDCOST PRO · METRIC CIVIL ESTIMATOR
            <button id="logoutBtn" type="button" onClick={handleLogout}>
              Logout
            </button>
          </div>
          <h1>Building Construction Cost Estimator</h1>
          <p>
            Professional engineering cost calculation with dedicated options for Excavation, Footings, Columns, Beam & Slab Dimensions, Rooms, separate Doors, Windows & Ventilation openings, Tiles, and Metric Rates.
          </p>
          <div style={{ marginTop: '16px' }}>
            <span className="tag">Plan · Calculate · Estimate (Metric m, m², m³)</span>
          </div>
        </div>
      </header>

      <main className="wrap">
        <section className="panel">
          <div className="steps" id="steps">
            <div
              className={`step ${currentStep === 0 ? 'active' : currentStep > 0 ? 'done' : ''}`}
              onClick={() => go(0)}
            >
              1. Project
            </div>
            <div
              className={`step ${currentStep === 1 ? 'active' : currentStep > 1 ? 'done' : ''}`}
              onClick={() => go(1)}
            >
              2. Excavation
            </div>
            <div
              className={`step ${currentStep === 2 ? 'active' : currentStep > 2 ? 'done' : ''}`}
              onClick={() => go(2)}
            >
              3. Footings
            </div>
            <div
              className={`step ${currentStep === 3 ? 'active' : currentStep > 3 ? 'done' : ''}`}
              onClick={() => go(3)}
            >
              4. Columns
            </div>
            <div
              className={`step ${currentStep === 4 ? 'active' : currentStep > 4 ? 'done' : ''}`}
              onClick={() => go(4)}
            >
              5. Beams & Slabs
            </div>
            <div
              className={`step ${currentStep === 5 ? 'active' : currentStep > 5 ? 'done' : ''}`}
              onClick={() => go(5)}
            >
              6. Walls & Rooms
            </div>
            <div
              className={`step ${currentStep === 6 ? 'active' : currentStep > 6 ? 'done' : ''}`}
              onClick={() => go(6)}
            >
              7. Openings
            </div>
            <div
              className={`step ${currentStep === 7 ? 'active' : currentStep > 7 ? 'done' : ''}`}
              onClick={() => go(7)}
            >
              8. Finishing & Tiles
            </div>
            <div
              className={`step ${currentStep === 8 ? 'active' : ''}`}
              onClick={() => go(8)}
            >
              9. Rates
            </div>
          </div>

          <form id="form" onSubmit={(e) => e.preventDefault()}>
            {/* Step 0: Project Details */}
            {currentStep === 0 && (
              <section className="page" data-page="0">
                <h2>Project Details</h2>
                <p className="sub">Enter general building, plot, and floor area details in metric units.</p>
                <div className="grid">
                  <div className="field">
                    <label>Project / Owner Name</label>
                    <input
                      id="project"
                      placeholder="e.g. Dream Villa / My Home"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Building Type</label>
                    <select
                      id="buildingType"
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value)}
                    >
                      <option>Residential</option>
                      <option>Commercial</option>
                      <option>Office</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Number of Floors</label>
                    <input
                      id="floors"
                      type="number"
                      min={1}
                      value={floors}
                      onChange={(e) => setFloors(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Plot Length (meters)</label>
                    <input
                      id="plotL"
                      type="number"
                      min={0}
                      step=".1"
                      value={plotL}
                      onChange={(e) => setPlotL(Number(e.target.value))}
                    />
                    <div className="unit">Total front-to-back length in meters</div>
                  </div>
                  <div className="field">
                    <label>Plot Width (meters)</label>
                    <input
                      id="plotW"
                      type="number"
                      min={0}
                      step=".1"
                      value={plotW}
                      onChange={(e) => setPlotW(Number(e.target.value))}
                    />
                    <div className="unit">Total plot frontage width in meters</div>
                  </div>
                  <div className="field">
                    <label>Built-up Area per Floor (sq. meters / m²)</label>
                    <input
                      id="area"
                      type="number"
                      min={0}
                      step=".1"
                      value={area}
                      onChange={(e) => setArea(Number(e.target.value))}
                    />
                    <div className="unit">e.g. 95 sq.m (~1020 sq.ft)</div>
                  </div>
                </div>
                <div className="actions">
                  <span></span>
                  <button type="button" className="btn primary" onClick={() => go(1)}>
                    Next: Excavation →
                  </button>
                </div>
              </section>
            )}

            {/* Step 1: Excavation (Dedicated Option) */}
            {currentStep === 1 && (
              <section className="page" data-page="1">
                <h2>Earthwork & Excavation</h2>
                <p className="sub">
                  Define excavation pit dimensions and working space margins in meters. Once filled, proceed to Footings.
                </p>

                <div className="field full">
                  <div className="live-badge">
                    <span>🚜 Total Excavation Volume:</span>
                    <strong>{fmt(totalExcavationVolume)} cu.m (m³)</strong>
                  </div>
                </div>

                <div className="field full" style={{ marginTop: '12px' }}>
                  <label>Column Footing Excavation Pits</label>
                  <div className="unit">
                    Add separate pit types for different foundation sizes. Working space margin covers side trenching and safety clearance.
                  </div>
                </div>

                <div id="excavationPits" className="field full" style={{ margin: 0, padding: 0 }}>
                  {excavationPits.map((pit, index) => {
                    const pitVol =
                      pit.count * pit.length * pit.width * pit.depth * (1 + pit.extra / 100);
                    return (
                      <div key={pit.id} className="column-type">
                        <div className="column-type-head">
                          <strong>
                            {pit.label || `Pit Type ${index + 1}`} · Subtotal: {fmt(pitVol)} m³
                          </strong>
                          {excavationPits.length > 1 && (
                            <button
                              type="button"
                              className="remove"
                              onClick={() => removeExcavationPit(pit.id)}
                            >
                              Remove Pit
                            </button>
                          )}
                        </div>
                        <div className="grid">
                          <div className="field">
                            <label>Pit Label / Name</label>
                            <input
                              type="text"
                              value={pit.label}
                              onChange={(e) =>
                                updateExcavationPit(pit.id, 'label', e.target.value)
                              }
                            />
                          </div>
                          <div className="field">
                            <label>Number of Pits (Qty)</label>
                            <input
                              type="number"
                              min={0}
                              value={pit.count}
                              onChange={(e) =>
                                updateExcavationPit(pit.id, 'count', Number(e.target.value))
                              }
                            />
                          </div>
                          <div className="field">
                            <label>Pit Length (meters)</label>
                            <input
                              type="number"
                              min={0}
                              step=".05"
                              value={pit.length}
                              onChange={(e) =>
                                updateExcavationPit(pit.id, 'length', Number(e.target.value))
                              }
                            />
                          </div>
                          <div className="field">
                            <label>Pit Width (meters)</label>
                            <input
                              type="number"
                              min={0}
                              step=".05"
                              value={pit.width}
                              onChange={(e) =>
                                updateExcavationPit(pit.id, 'width', Number(e.target.value))
                              }
                            />
                          </div>
                          <div className="field">
                            <label>Pit Depth (meters)</label>
                            <input
                              type="number"
                              min={0}
                              step=".05"
                              value={pit.depth}
                              onChange={(e) =>
                                updateExcavationPit(pit.id, 'depth', Number(e.target.value))
                              }
                            />
                          </div>
                          <div className="field">
                            <label>Working Space Extra Margin (%)</label>
                            <input
                              type="number"
                              min={0}
                              step=".1"
                              value={pit.extra}
                              onChange={(e) =>
                                updateExcavationPit(pit.id, 'extra', Number(e.target.value))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="field full">
                  <button type="button" className="add" onClick={addExcavationPit}>
                    ＋ Add Another Excavation Pit Type
                  </button>
                </div>

                <div className="column-type" style={{ marginTop: '16px' }}>
                  <div className="column-type-head">
                    <strong>Optional: Continuous Foundation Trench Excavation</strong>
                  </div>
                  <div className="grid">
                    <div className="field">
                      <label>Trench Length (meters)</label>
                      <input
                        type="number"
                        min={0}
                        step=".1"
                        value={trenchLength}
                        onChange={(e) => setTrenchLength(Number(e.target.value))}
                      />
                      <div className="unit">0 if only isolated pit excavation</div>
                    </div>
                    <div className="field">
                      <label>Trench Width (meters)</label>
                      <input
                        type="number"
                        min={0}
                        step=".05"
                        value={trenchWidth}
                        onChange={(e) => setTrenchWidth(Number(e.target.value))}
                      />
                    </div>
                    <div className="field">
                      <label>Trench Depth (meters)</label>
                      <input
                        type="number"
                        min={0}
                        step=".05"
                        value={trenchDepth}
                        onChange={(e) => setTrenchDepth(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>

                <div className="actions">
                  <button type="button" className="btn secondary" onClick={() => go(0)}>
                    ← Back: Project
                  </button>
                  <button type="button" className="btn primary" onClick={() => go(2)}>
                    Next: Footings →
                  </button>
                </div>
              </section>
            )}

            {/* Step 2: Footings (Dedicated Option) */}
            {currentStep === 2 && (
              <section className="page" data-page="2">
                <h2>Footing (Foundation Concrete)</h2>
                <p className="sub">
                  Excavation filled! Now enter reinforced concrete footing dimensions and quantities in meters.
                </p>

                <div className="field full">
                  <div className="live-badge">
                    <span>🏗️ Total Footing Concrete:</span>
                    <strong>{fmt(totalFootingVolume)} cu.m (m³)</strong>
                  </div>
                </div>

                <div id="footings" className="field full" style={{ margin: 0, padding: 0, marginTop: '12px' }}>
                  {footings.map((ft, index) => {
                    const ftVol = ft.count * ft.length * ft.width * ft.thickness;
                    return (
                      <div key={ft.id} className="column-type">
                        <div className="column-type-head">
                          <strong>
                            {ft.label || `Footing Type ${index + 1}`} · Subtotal: {fmt(ftVol)} m³
                          </strong>
                          {footings.length > 1 && (
                            <button
                              type="button"
                              className="remove"
                              onClick={() => removeFooting(ft.id)}
                            >
                              Remove Footing
                            </button>
                          )}
                        </div>
                        <div className="grid">
                          <div className="field">
                            <label>Footing Type Name</label>
                            <input
                              type="text"
                              value={ft.label}
                              onChange={(e) =>
                                updateFooting(ft.id, 'label', e.target.value)
                              }
                            />
                          </div>
                          <div className="field">
                            <label>Footing Quantity (Nos.)</label>
                            <input
                              type="number"
                              min={0}
                              value={ft.count}
                              onChange={(e) =>
                                updateFooting(ft.id, 'count', Number(e.target.value))
                              }
                            />
                          </div>
                          <div className="field">
                            <label>Footing Length (meters)</label>
                            <input
                              type="number"
                              min={0}
                              step=".05"
                              value={ft.length}
                              onChange={(e) =>
                                updateFooting(ft.id, 'length', Number(e.target.value))
                              }
                            />
                            <div className="unit">e.g. 1.2 m (~ 4 ft)</div>
                          </div>
                          <div className="field">
                            <label>Footing Width (meters)</label>
                            <input
                              type="number"
                              min={0}
                              step=".05"
                              value={ft.width}
                              onChange={(e) =>
                                updateFooting(ft.id, 'width', Number(e.target.value))
                              }
                            />
                            <div className="unit">e.g. 1.2 m (~ 4 ft)</div>
                          </div>
                          <div className="field">
                            <label>Footing Depth / Thickness (meters)</label>
                            <input
                              type="number"
                              min={0}
                              step=".05"
                              value={ft.thickness}
                              onChange={(e) =>
                                updateFooting(ft.id, 'thickness', Number(e.target.value))
                              }
                            />
                            <div className="unit">e.g. 0.35 m (~ 14 inches)</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="field full">
                  <button type="button" className="add" onClick={addFooting}>
                    ＋ Add Another Footing Type
                  </button>
                </div>

                <div className="actions">
                  <button type="button" className="btn secondary" onClick={() => go(1)}>
                    ← Back: Excavation
                  </button>
                  <button type="button" className="btn primary" onClick={() => go(3)}>
                    Next: Columns →
                  </button>
                </div>
              </section>
            )}

            {/* Step 3: Columns (Dedicated Option) */}
            {currentStep === 3 && (
              <section className="page" data-page="3">
                <h2>Column Sizing & Geometry</h2>
                <p className="sub">
                  Footing filled! Now configure column sizes (width, depth, height) and quantities in meters.
                </p>

                <div className="field full">
                  <div className="live-badge">
                    <span>🏛️ Total Column Concrete:</span>
                    <strong>{fmt(totalColumnVolume)} cu.m (m³)</strong>
                  </div>
                </div>

                <div id="columns" className="field full" style={{ margin: 0, padding: 0, marginTop: '12px' }}>
                  {columns.map((col, index) => {
                    const colVol = col.count * col.width * col.depth * col.height;
                    return (
                      <div key={col.id} className="column-type">
                        <div className="column-type-head">
                          <strong>
                            {col.label || `Column Type ${index + 1}`} · Subtotal: {fmt(colVol)} m³
                          </strong>
                          {columns.length > 1 && (
                            <button
                              type="button"
                              className="remove"
                              onClick={() => removeColumn(col.id)}
                            >
                              Remove Column
                            </button>
                          )}
                        </div>
                        <div className="grid">
                          <div className="field">
                            <label>Column Type Name</label>
                            <input
                              type="text"
                              value={col.label}
                              onChange={(e) =>
                                updateColumn(col.id, 'label', e.target.value)
                              }
                            />
                          </div>
                          <div className="field">
                            <label>Column Quantity (Nos.)</label>
                            <input
                              type="number"
                              min={0}
                              value={col.count}
                              onChange={(e) =>
                                updateColumn(col.id, 'count', Number(e.target.value))
                              }
                            />
                          </div>
                          <div className="field">
                            <label>Column Width (meters)</label>
                            <input
                              type="number"
                              min={0}
                              step=".01"
                              value={col.width}
                              onChange={(e) =>
                                updateColumn(col.id, 'width', Number(e.target.value))
                              }
                            />
                            <div className="unit">e.g. 0.23 m = 230 mm (9 inches)</div>
                          </div>
                          <div className="field">
                            <label>Column Depth (meters)</label>
                            <input
                              type="number"
                              min={0}
                              step=".01"
                              value={col.depth}
                              onChange={(e) =>
                                updateColumn(col.id, 'depth', Number(e.target.value))
                              }
                            />
                            <div className="unit">e.g. 0.23 m = 230 mm (9 inches)</div>
                          </div>
                          <div className="field">
                            <label>Column Height (meters)</label>
                            <input
                              type="number"
                              min={0}
                              step=".1"
                              value={col.height}
                              onChange={(e) =>
                                updateColumn(col.id, 'height', Number(e.target.value))
                              }
                            />
                            <div className="unit">e.g. 3.0 m (~ 10 ft)</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="field full">
                  <button type="button" className="add" onClick={addColumn}>
                    ＋ Add Another Column Type
                  </button>
                </div>

                <div className="actions">
                  <button type="button" className="btn secondary" onClick={() => go(2)}>
                    ← Back: Footings
                  </button>
                  <button type="button" className="btn primary" onClick={() => go(4)}>
                    Next: Beams & Slabs →
                  </button>
                </div>
              </section>
            )}

            {/* Step 4: RCC Superstructure (Beams & Slab Dimensions) */}
            {currentStep === 4 && (
              <section className="page" data-page="4">
                <h2>Beams & Slab Dimensions (RCC Superstructure)</h2>
                <p className="sub">
                  Configure explicit Slab Dimensions (Length, Width, Thickness), Plinth/Roof Beams, and Mix specifications.
                </p>

                {/* Slabs Dimension Manager */}
                <div className="column-type" style={{ background: '#f8fbfe', border: '1px solid #bde0f5' }}>
                  <div className="column-type-head">
                    <div>
                      <strong style={{ fontSize: '15px' }}>📐 Slab Dimensions & Panels</strong>
                      <div className="unit">Configure exact Length, Width, and Thickness for all floor & roof slab panels.</div>
                    </div>
                    <button
                      type="button"
                      className="btn secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={autoFillSlabFromArea}
                    >
                      ⚡ Auto-Fill from Built-up Area
                    </button>
                  </div>

                  <div className="field full">
                    <div className="live-badge">
                      <span>Total Slab Area: <strong>{fmt(totalSlabArea)} m²</strong></span>
                      <span style={{ margin: '0 8px' }}>|</span>
                      <span>Total Slab Volume: <strong>{fmt(totalSlabVolume)} cu.m (m³)</strong></span>
                    </div>
                  </div>

                  <div id="slabPanels" style={{ marginTop: '12px' }}>
                    {slabs.map((slabItem, index) => {
                      const panelArea = slabItem.count * slabItem.length * slabItem.width;
                      const panelVol = panelArea * slabItem.thickness;
                      return (
                        <div
                          key={slabItem.id}
                          className="item"
                          style={{ background: '#fff', border: '1px solid #d4e6f4' }}
                        >
                          <div className="item-head">
                            <strong>
                              {slabItem.label || `Slab Panel ${index + 1}`} · Area: {fmt(panelArea)} m² · Volume: {fmt(panelVol)} m³
                            </strong>
                            {slabs.length > 1 && (
                              <button
                                type="button"
                                className="remove"
                                onClick={() => removeSlab(slabItem.id)}
                              >
                                Remove Slab
                              </button>
                            )}
                          </div>
                          <div className="grid">
                            <div className="field">
                              <label>Slab Panel Name / Type</label>
                              <input
                                type="text"
                                value={slabItem.label}
                                onChange={(e) =>
                                  updateSlab(slabItem.id, 'label', e.target.value)
                                }
                              />
                            </div>
                            <div className="field">
                              <label>Number of Floors / Slabs (Qty)</label>
                              <input
                                type="number"
                                min={1}
                                value={slabItem.count}
                                onChange={(e) =>
                                  updateSlab(slabItem.id, 'count', Number(e.target.value))
                                }
                              />
                            </div>
                            <div className="field">
                              <label>Slab Length (meters)</label>
                              <input
                                type="number"
                                min={0}
                                step=".1"
                                value={slabItem.length}
                                onChange={(e) =>
                                  updateSlab(slabItem.id, 'length', Number(e.target.value))
                                }
                              />
                              <div className="unit">e.g. 10.0 m</div>
                            </div>
                            <div className="field">
                              <label>Slab Width (meters)</label>
                              <input
                                type="number"
                                min={0}
                                step=".1"
                                value={slabItem.width}
                                onChange={(e) =>
                                  updateSlab(slabItem.id, 'width', Number(e.target.value))
                                }
                              />
                              <div className="unit">e.g. 9.5 m</div>
                            </div>
                            <div className="field">
                              <label>Slab Thickness (meters)</label>
                              <input
                                type="number"
                                min={0}
                                step=".005"
                                value={slabItem.thickness}
                                onChange={(e) =>
                                  updateSlab(slabItem.id, 'thickness', Number(e.target.value))
                                }
                              />
                              <div className="unit">e.g. 0.125 m = 125 mm (5 inches)</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" className="add" onClick={addSlab} style={{ marginTop: '8px' }}>
                    ＋ Add Another Slab Panel (Balcony, Porch, Canopy etc.)
                  </button>
                </div>

                {/* Beams & Mix Parameters */}
                <h3 style={{ margin: '22px 0 10px', color: '#153d5c', fontSize: '17px' }}>
                  Beam Geometry & Concrete Specifications
                </h3>
                <div className="grid">
                  <div className="field">
                    <label>Total Beam Length (running meters)</label>
                    <input
                      id="beamLength"
                      type="number"
                      min={0}
                      step=".5"
                      value={beamLength}
                      onChange={(e) => setBeamLength(Number(e.target.value))}
                    />
                    <div className="unit">Total plinth + lintel + roof beam length</div>
                  </div>
                  <div className="field">
                    <label>Beam Width (meters)</label>
                    <input
                      id="beamW"
                      type="number"
                      min={0}
                      step=".01"
                      value={beamW}
                      onChange={(e) => setBeamW(Number(e.target.value))}
                    />
                    <div className="unit">e.g. 0.23 m (230 mm)</div>
                  </div>
                  <div className="field">
                    <label>Beam Depth (meters)</label>
                    <input
                      id="beamD"
                      type="number"
                      min={0}
                      step=".01"
                      value={beamD}
                      onChange={(e) => setBeamD(Number(e.target.value))}
                    />
                    <div className="unit">e.g. 0.30 m (300 mm)</div>
                  </div>
                  <div className="field">
                    <label>Concrete Mix: Cement Part</label>
                    <input
                      id="mixC"
                      type="number"
                      min={0.1}
                      step=".1"
                      value={mixC}
                      onChange={(e) => setMixC(Number(e.target.value))}
                    />
                    <div className="unit">e.g. 1 for M20 (1:1.5:3) or M15 (1:2:4)</div>
                  </div>
                  <div className="field">
                    <label>Concrete Mix: Sand Part</label>
                    <input
                      id="mixS"
                      type="number"
                      min={0}
                      step=".1"
                      value={mixS}
                      onChange={(e) => setMixS(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Concrete Mix: Aggregate Part</label>
                    <input
                      id="mixA"
                      type="number"
                      min={0}
                      step=".1"
                      value={mixA}
                      onChange={(e) => setMixA(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Steel Consumption (kg / m³ of RCC)</label>
                    <input
                      id="steelFactor"
                      type="number"
                      min={0}
                      value={steelFactor}
                      onChange={(e) => setSteelFactor(Number(e.target.value))}
                    />
                    <div className="unit">Standard average: 80 - 130 kg/m³</div>
                  </div>
                  <div className="field">
                    <label>Staircase / Misc. RCC Volume (cu.m / m³)</label>
                    <input
                      id="miscRcc"
                      type="number"
                      min={0}
                      step=".1"
                      value={miscRcc}
                      onChange={(e) => setMiscRcc(Number(e.target.value))}
                    />
                  </div>
                </div>
                <div className="actions">
                  <button type="button" className="btn secondary" onClick={() => go(3)}>
                    ← Back: Columns
                  </button>
                  <button type="button" className="btn primary" onClick={() => go(5)}>
                    Next: Walls & Rooms →
                  </button>
                </div>
              </section>
            )}

            {/* Step 5: Walls & Rooms */}
            {currentStep === 5 && (
              <section className="page" data-page="5">
                <h2>Rooms & Wall Measurements</h2>
                <p className="sub">Add room configurations and specify total wall dimensions in meters.</p>

                <div id="rooms">
                  {rooms.map((room, index) => (
                    <div key={room.id} className="item">
                      <div className="item-head">
                        <strong>Room {index + 1}: {room.type}</strong>
                        <button
                          type="button"
                          className="remove"
                          onClick={() => removeRoom(room.id)}
                        >
                          Remove
                        </button>
                      </div>
                      <div className="grid">
                        <div className="field">
                          <label>Room Type</label>
                          <select
                            className="roomType"
                            value={room.type}
                            onChange={(e) => updateRoom(room.id, 'type', e.target.value)}
                          >
                            <option value="Bedroom">Bedroom</option>
                            <option value="Living / Hall">Living / Hall</option>
                            <option value="Kitchen">Kitchen</option>
                            <option value="Bathroom">Bathroom</option>
                            <option value="Toilet">Toilet</option>
                            <option value="Store">Store</option>
                            <option value="Balcony">Balcony</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div className="field">
                          <label>Length (meters)</label>
                          <input
                            className="roomL"
                            type="number"
                            min={0}
                            step=".1"
                            value={room.l}
                            onChange={(e) => updateRoom(room.id, 'l', Number(e.target.value))}
                          />
                        </div>
                        <div className="field">
                          <label>Width (meters)</label>
                          <input
                            className="roomW"
                            type="number"
                            min={0}
                            step=".1"
                            value={room.w}
                            onChange={(e) => updateRoom(room.id, 'w', Number(e.target.value))}
                          />
                        </div>
                        <div className="field">
                          <label>Number of Rooms</label>
                          <input
                            className="roomN"
                            type="number"
                            min={0}
                            value={room.n}
                            onChange={(e) => updateRoom(room.id, 'n', Number(e.target.value))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button type="button" className="add" onClick={addRoom}>
                  ＋ Add Room
                </button>

                <div className="grid" style={{ marginTop: '18px' }}>
                  <div className="field">
                    <label>Total Wall Length (running meters / floor)</label>
                    <input
                      id="wallLength"
                      type="number"
                      min={0}
                      step=".5"
                      value={wallLength}
                      onChange={(e) => setWallLength(Number(e.target.value))}
                    />
                    <div className="unit">External + internal partition walls</div>
                  </div>
                  <div className="field">
                    <label>Wall Height (meters)</label>
                    <input
                      id="wallHeight"
                      type="number"
                      min={0}
                      step=".1"
                      value={wallHeight}
                      onChange={(e) => setWallHeight(Number(e.target.value))}
                    />
                    <div className="unit">Floor-to-ceiling height (e.g. 3.0 m)</div>
                  </div>
                  <div className="field">
                    <label>Wall Thickness (meters)</label>
                    <input
                      id="wallThick"
                      type="number"
                      min={0}
                      step=".01"
                      value={wallThick}
                      onChange={(e) => setWallThick(Number(e.target.value))}
                    />
                    <div className="unit">e.g. 0.23 m (230 mm / 9") or 0.115 m (4.5")</div>
                  </div>
                  <div className="field">
                    <label>Brickwork Mortar: Cement Part</label>
                    <input
                      id="mortarC"
                      type="number"
                      min={0.1}
                      step=".1"
                      value={mortarC}
                      onChange={(e) => setMortarC(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Brickwork Mortar: Sand Part</label>
                    <input
                      id="mortarS"
                      type="number"
                      min={0.1}
                      step=".1"
                      value={mortarS}
                      onChange={(e) => setMortarS(Number(e.target.value))}
                    />
                    <div className="unit">Standard 1:6 ratio</div>
                  </div>
                  <div className="field">
                    <label>Bricks per cubic meter (cu.m) of brickwork</label>
                    <input
                      id="brickFactor"
                      type="number"
                      min={1}
                      value={brickFactor}
                      onChange={(e) => setBrickFactor(Number(e.target.value))}
                    />
                    <div className="unit">Standard metric brick: 500 pcs / m³</div>
                  </div>
                </div>
                <div className="actions">
                  <button type="button" className="btn secondary" onClick={() => go(4)}>
                    ← Back: Beams & Slabs
                  </button>
                  <button type="button" className="btn primary" onClick={() => go(6)}>
                    Next: Doors, Windows & Ventilation →
                  </button>
                </div>
              </section>
            )}

            {/* Step 6: Dedicated Openings (Doors, Windows, and Ventilation separately) */}
            {currentStep === 6 && (
              <section className="page" data-page="6">
                <h2>Openings (Doors, Windows & Ventilation)</h2>
                <p className="sub">
                  Dedicated separate options for Doors, Windows, and Ventilators. All openings are accurately deducted from gross brickwork and plastering.
                </p>

                <div className="field full">
                  <div className="live-badge">
                    <span>🚪 Doors: <strong>{fmt(totalDoorArea)} m²</strong> ({totalDoorCount} pcs)</span>
                    <span style={{ margin: '0 8px' }}>|</span>
                    <span>🪟 Windows: <strong>{fmt(totalWindowArea)} m²</strong> ({totalWindowCount} pcs)</span>
                    <span style={{ margin: '0 8px' }}>|</span>
                    <span>💨 Vents: <strong>{fmt(totalVentArea)} m²</strong> ({totalVentCount} pcs)</span>
                    <span style={{ margin: '0 8px' }}>|</span>
                    <span>Total Deducted: <strong>{fmt(totalOpeningsArea)} m²</strong></span>
                  </div>
                </div>

                {/* 1. SEPARATE DOORS SECTION */}
                <div className="column-type" style={{ marginTop: '16px', borderLeft: '4px solid #1268a5' }}>
                  <div className="column-type-head">
                    <div>
                      <strong style={{ fontSize: '16px', color: '#1268a5' }}>🚪 Door Openings Configuration</strong>
                      <div className="unit">Define different door types (Main door, Bedroom doors, Toilet doors) with Width and Height in meters.</div>
                    </div>
                  </div>

                  <div id="doorsList">
                    {doorsList.map((door, index) => {
                      const dArea = door.count * door.width * door.height;
                      return (
                        <div key={door.id} className="item" style={{ background: '#fff' }}>
                          <div className="item-head">
                            <strong>{door.label || `Door ${index + 1}`} · Total Area: {fmt(dArea)} m²</strong>
                            {doorsList.length > 1 && (
                              <button
                                type="button"
                                className="remove"
                                onClick={() => removeDoor(door.id)}
                              >
                                Remove Door
                              </button>
                            )}
                          </div>
                          <div className="grid">
                            <div className="field">
                              <label>Door Type Name</label>
                              <input
                                type="text"
                                value={door.label}
                                onChange={(e) => updateDoor(door.id, 'label', e.target.value)}
                              />
                            </div>
                            <div className="field">
                              <label>Door Quantity (Nos.)</label>
                              <input
                                type="number"
                                min={0}
                                value={door.count}
                                onChange={(e) => updateDoor(door.id, 'count', Number(e.target.value))}
                              />
                            </div>
                            <div className="field">
                              <label>Door Width (meters)</label>
                              <input
                                type="number"
                                min={0}
                                step=".05"
                                value={door.width}
                                onChange={(e) => updateDoor(door.id, 'width', Number(e.target.value))}
                              />
                              <div className="unit">e.g. 1.0 m or 0.9 m</div>
                            </div>
                            <div className="field">
                              <label>Door Height (meters)</label>
                              <input
                                type="number"
                                min={0}
                                step=".05"
                                value={door.height}
                                onChange={(e) => updateDoor(door.id, 'height', Number(e.target.value))}
                              />
                              <div className="unit">e.g. 2.1 m (7 ft)</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" className="add" onClick={addDoor}>
                    ＋ Add Another Door Type
                  </button>
                </div>

                {/* 2. SEPARATE WINDOWS SECTION */}
                <div className="column-type" style={{ marginTop: '18px', borderLeft: '4px solid #22b8cf' }}>
                  <div className="column-type-head">
                    <div>
                      <strong style={{ fontSize: '16px', color: '#097180' }}>🪟 Window Openings Configuration</strong>
                      <div className="unit">Define different window sizes (Large hall windows, Bedroom windows, Kitchen windows) in meters.</div>
                    </div>
                  </div>

                  <div id="windowsList">
                    {windowsList.map((win, index) => {
                      const wArea = win.count * win.width * win.height;
                      return (
                        <div key={win.id} className="item" style={{ background: '#fff' }}>
                          <div className="item-head">
                            <strong>{win.label || `Window ${index + 1}`} · Total Area: {fmt(wArea)} m²</strong>
                            {windowsList.length > 1 && (
                              <button
                                type="button"
                                className="remove"
                                onClick={() => removeWindow(win.id)}
                              >
                                Remove Window
                              </button>
                            )}
                          </div>
                          <div className="grid">
                            <div className="field">
                              <label>Window Type Name</label>
                              <input
                                type="text"
                                value={win.label}
                                onChange={(e) => updateWindow(win.id, 'label', e.target.value)}
                              />
                            </div>
                            <div className="field">
                              <label>Window Quantity (Nos.)</label>
                              <input
                                type="number"
                                min={0}
                                value={win.count}
                                onChange={(e) => updateWindow(win.id, 'count', Number(e.target.value))}
                              />
                            </div>
                            <div className="field">
                              <label>Window Width (meters)</label>
                              <input
                                type="number"
                                min={0}
                                step=".05"
                                value={win.width}
                                onChange={(e) => updateWindow(win.id, 'width', Number(e.target.value))}
                              />
                              <div className="unit">e.g. 1.2 m or 1.5 m</div>
                            </div>
                            <div className="field">
                              <label>Window Height (meters)</label>
                              <input
                                type="number"
                                min={0}
                                step=".05"
                                value={win.height}
                                onChange={(e) => updateWindow(win.id, 'height', Number(e.target.value))}
                              />
                              <div className="unit">e.g. 1.2 m (4 ft)</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" className="add" onClick={addWindow}>
                    ＋ Add Another Window Type
                  </button>
                </div>

                {/* 3. SEPARATE VENTILATORS SECTION */}
                <div className="column-type" style={{ marginTop: '18px', borderLeft: '4px solid #ffc24b' }}>
                  <div className="column-type-head">
                    <div>
                      <strong style={{ fontSize: '16px', color: '#976607' }}>💨 Ventilation Openings Configuration</strong>
                      <div className="unit">Specify ventilation and exhaust fan openings for bathrooms, kitchen, and utility shafts in meters.</div>
                    </div>
                  </div>

                  <div id="ventsList">
                    {ventsList.map((vent, index) => {
                      const vArea = vent.count * vent.width * vent.height;
                      return (
                        <div key={vent.id} className="item" style={{ background: '#fff' }}>
                          <div className="item-head">
                            <strong>{vent.label || `Ventilator ${index + 1}`} · Total Area: {fmt(vArea)} m²</strong>
                            {ventsList.length > 1 && (
                              <button
                                type="button"
                                className="remove"
                                onClick={() => removeVentilator(vent.id)}
                              >
                                Remove Ventilator
                              </button>
                            )}
                          </div>
                          <div className="grid">
                            <div className="field">
                              <label>Ventilator Type Name</label>
                              <input
                                type="text"
                                value={vent.label}
                                onChange={(e) => updateVentilator(vent.id, 'label', e.target.value)}
                              />
                            </div>
                            <div className="field">
                              <label>Ventilator Quantity (Nos.)</label>
                              <input
                                type="number"
                                min={0}
                                value={vent.count}
                                onChange={(e) => updateVentilator(vent.id, 'count', Number(e.target.value))}
                              />
                            </div>
                            <div className="field">
                              <label>Ventilator Width (meters)</label>
                              <input
                                type="number"
                                min={0}
                                step=".05"
                                value={vent.width}
                                onChange={(e) => updateVentilator(vent.id, 'width', Number(e.target.value))}
                              />
                              <div className="unit">e.g. 0.6 m</div>
                            </div>
                            <div className="field">
                              <label>Ventilator Height (meters)</label>
                              <input
                                type="number"
                                min={0}
                                step=".05"
                                value={vent.height}
                                onChange={(e) => updateVentilator(vent.id, 'height', Number(e.target.value))}
                              />
                              <div className="unit">e.g. 0.45 m</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button type="button" className="add" onClick={addVentilator}>
                    ＋ Add Another Ventilator Type
                  </button>
                </div>

                <div className="actions">
                  <button type="button" className="btn secondary" onClick={() => go(5)}>
                    ← Back: Walls & Rooms
                  </button>
                  <button type="button" className="btn primary" onClick={() => go(7)}>
                    Next: Finishing & Tiles →
                  </button>
                </div>
              </section>
            )}

            {/* Step 7: Finishing, Tiles, Electrical & Plumbing */}
            {currentStep === 7 && (
              <section className="page" data-page="7">
                <h2>Finishing, Tiles & Services</h2>
                <p className="sub">Enter floor tiles, wall dado tiles, plastering, paint coats, and MEP specifications.</p>
                <div className="grid">
                  <div className="field">
                    <label>Floor Tiles Area (sq.m; 0 = auto from slab area)</label>
                    <input
                      id="floorArea"
                      type="number"
                      min={0}
                      step=".5"
                      value={floorArea}
                      onChange={(e) => setFloorArea(Number(e.target.value))}
                    />
                    <div className="unit">Vitrified / ceramic tile flooring area</div>
                  </div>
                  <div className="field">
                    <label>Wall Dado Tiles Area (Bathrooms & Kitchens sq.m)</label>
                    <input
                      id="wallTilesArea"
                      type="number"
                      min={0}
                      step=".5"
                      value={wallTilesArea}
                      onChange={(e) => setWallTilesArea(Number(e.target.value))}
                    />
                    <div className="unit">Glazed ceramic wall tiles up to 7ft height</div>
                  </div>
                  <div className="field">
                    <label>Plaster Sides (1 or 2)</label>
                    <select
                      id="plasterSides"
                      value={plasterSides}
                      onChange={(e) => setPlasterSides(Number(e.target.value))}
                    >
                      <option value={2}>Both sides (Internal & External)</option>
                      <option value={1}>One side</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Plaster Thickness (mm)</label>
                    <input
                      id="plasterThick"
                      type="number"
                      min={0}
                      value={plasterThick}
                      onChange={(e) => setPlasterThick(Number(e.target.value))}
                    />
                    <div className="unit">Standard: 12 mm or 15 mm</div>
                  </div>
                  <div className="field">
                    <label>Paint Application Coats</label>
                    <input
                      id="paintCoats"
                      type="number"
                      min={0}
                      value={paintCoats}
                      onChange={(e) => setPaintCoats(Number(e.target.value))}
                    />
                    <div className="unit">Standard: 2 coats primer & emulsion</div>
                  </div>
                  <div className="field">
                    <label>Electrical Points (Nos.)</label>
                    <input
                      id="electricalPoints"
                      type="number"
                      min={0}
                      value={electricalPoints}
                      onChange={(e) => setElectricalPoints(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Plumbing Fixtures (taps, WC, basins etc.)</label>
                    <input
                      id="plumbingFixtures"
                      type="number"
                      min={0}
                      value={plumbingFixtures}
                      onChange={(e) => setPlumbingFixtures(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Waterproofing Area (sq. meters / m²)</label>
                    <input
                      id="waterproofArea"
                      type="number"
                      min={0}
                      step=".5"
                      value={waterproofArea}
                      onChange={(e) => setWaterproofArea(Number(e.target.value))}
                    />
                    <div className="unit">Roof slab, toilets, and sunken slabs</div>
                  </div>
                </div>
                <div className="actions">
                  <button type="button" className="btn secondary" onClick={() => go(6)}>
                    ← Back: Openings
                  </button>
                  <button type="button" className="btn primary" onClick={() => go(8)}>
                    Next: Rates →
                  </button>
                </div>
              </section>
            )}

            {/* Step 8: Material & Labour Rates */}
            {currentStep === 8 && (
              <section className="page" data-page="8">
                <h2>Material & Labour Rates (Metric Units)</h2>
                <p className="sub">
                  Market rates in Indian Rupees (₹) for all newly configured items including Tiles, Doors, Windows, Ventilators, and Slab Formwork.
                </p>

                {/* 1. Structural & Core Materials */}
                <h3 style={{ margin: '18px 0 10px', color: '#153d5c', fontSize: '16px' }}>
                  1. Core Civil Materials & Earthwork
                </h3>
                <div className="grid">
                  <div className="field">
                    <label>Cement (₹ / 50kg bag)</label>
                    <input
                      id="cementRate"
                      type="number"
                      min={0}
                      value={cementRate}
                      onChange={(e) => setCementRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Sand (₹ / cu.m / m³)</label>
                    <input
                      id="sandRate"
                      type="number"
                      min={0}
                      value={sandRate}
                      onChange={(e) => setSandRate(Number(e.target.value))}
                    />
                    <div className="unit">River/manufactured sand per m³</div>
                  </div>
                  <div className="field">
                    <label>Aggregate / Gravel (₹ / cu.m / m³)</label>
                    <input
                      id="aggRate"
                      type="number"
                      min={0}
                      value={aggRate}
                      onChange={(e) => setAggRate(Number(e.target.value))}
                    />
                    <div className="unit">Blue metal coarse gravel per m³</div>
                  </div>
                  <div className="field">
                    <label>Reinforcement Steel (₹ / kg)</label>
                    <input
                      id="steelRate"
                      type="number"
                      min={0}
                      value={steelRate}
                      onChange={(e) => setSteelRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Bricks (₹ / piece)</label>
                    <input
                      id="brickRate"
                      type="number"
                      min={0}
                      value={brickRate}
                      onChange={(e) => setBrickRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Excavation (₹ / cu.m / m³)</label>
                    <input
                      id="excRate"
                      type="number"
                      min={0}
                      value={excRate}
                      onChange={(e) => setExcRate(Number(e.target.value))}
                    />
                  </div>
                </div>

                {/* 2. Structural Labour & Slab Formwork */}
                <h3 style={{ margin: '22px 0 10px', color: '#153d5c', fontSize: '16px' }}>
                  2. Slab Formwork & Structural Labour
                </h3>
                <div className="grid">
                  <div className="field">
                    <label>Slab & Beam Formwork / Shuttering (₹ / sq.m)</label>
                    <input
                      id="shutteringRate"
                      type="number"
                      min={0}
                      value={shutteringRate}
                      onChange={(e) => setShutteringRate(Number(e.target.value))}
                    />
                    <div className="unit">Centering, staging & de-shuttering per m² of slab</div>
                  </div>
                  <div className="field">
                    <label>Structural Construction Labour (₹ / sq.m built-up)</label>
                    <input
                      id="labourRate"
                      type="number"
                      min={0}
                      value={labourRate}
                      onChange={(e) => setLabourRate(Number(e.target.value))}
                    />
                    <div className="unit">Civil masonry & casting labour rate</div>
                  </div>
                </div>

                {/* 3. Openings (Doors, Windows & Ventilators Rates) */}
                <h3 style={{ margin: '22px 0 10px', color: '#153d5c', fontSize: '16px' }}>
                  3. Openings Supply & Installation Rates (Doors, Windows, Vents)
                </h3>
                <div className="grid">
                  <div className="field">
                    <label>Doors: Supply & Fixing (₹ / door)</label>
                    <input
                      id="doorRate"
                      type="number"
                      min={0}
                      value={doorRate}
                      onChange={(e) => setDoorRate(Number(e.target.value))}
                    />
                    <div className="unit">Frame + flush/panel shutter + lock & fittings</div>
                  </div>
                  <div className="field">
                    <label>Windows: Supply & Fixing (₹ / window)</label>
                    <input
                      id="windowRate"
                      type="number"
                      min={0}
                      value={windowRate}
                      onChange={(e) => setWindowRate(Number(e.target.value))}
                    />
                    <div className="unit">Section frame + glass panes + MS safety grill</div>
                  </div>
                  <div className="field">
                    <label>Ventilators: Supply & Fixing (₹ / ventilator)</label>
                    <input
                      id="ventRate"
                      type="number"
                      min={0}
                      value={ventRate}
                      onChange={(e) => setVentRate(Number(e.target.value))}
                    />
                    <div className="unit">Louvers + glass + exhaust fan provision</div>
                  </div>
                </div>

                {/* 4. Tiles, Finishing & Services */}
                <h3 style={{ margin: '22px 0 10px', color: '#153d5c', fontSize: '16px' }}>
                  4. Tiles, Finishing & MEP Services Rates
                </h3>
                <div className="grid">
                  <div className="field">
                    <label>Floor Tiles: Material + Laying (₹ / sq.m)</label>
                    <input
                      id="floorRate"
                      type="number"
                      min={0}
                      value={floorRate}
                      onChange={(e) => setFloorRate(Number(e.target.value))}
                    />
                    <div className="unit">Vitrified tiles + cement mortar bedding & grout</div>
                  </div>
                  <div className="field">
                    <label>Wall Dado Tiles: Material + Laying (₹ / sq.m)</label>
                    <input
                      id="wallTilesRate"
                      type="number"
                      min={0}
                      value={wallTilesRate}
                      onChange={(e) => setWallTilesRate(Number(e.target.value))}
                    />
                    <div className="unit">Glazed wall tiles for bathrooms & kitchens</div>
                  </div>
                  <div className="field">
                    <label>Plastering (₹ / sq.m)</label>
                    <input
                      id="plasterRate"
                      type="number"
                      min={0}
                      value={plasterRate}
                      onChange={(e) => setPlasterRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Painting (₹ / sq.m per coat)</label>
                    <input
                      id="paintRate"
                      type="number"
                      min={0}
                      value={paintRate}
                      onChange={(e) => setPaintRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Electrical (₹ / point)</label>
                    <input
                      id="electricalRate"
                      type="number"
                      min={0}
                      value={electricalRate}
                      onChange={(e) => setElectricalRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Plumbing (₹ / fixture)</label>
                    <input
                      id="plumbingRate"
                      type="number"
                      min={0}
                      value={plumbingRate}
                      onChange={(e) => setPlumbingRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Waterproofing (₹ / sq.m)</label>
                    <input
                      id="waterproofRate"
                      type="number"
                      min={0}
                      value={waterproofRate}
                      onChange={(e) => setWaterproofRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Miscellaneous / Site Expenses (₹ Lump sum)</label>
                    <input
                      id="miscRate"
                      type="number"
                      min={0}
                      value={miscRate}
                      onChange={(e) => setMiscRate(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Material Wastage (%)</label>
                    <input
                      id="wastage"
                      type="number"
                      min={0}
                      value={wastage}
                      onChange={(e) => setWastage(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Contingency Margin (%)</label>
                    <input
                      id="contingency"
                      type="number"
                      min={0}
                      value={contingency}
                      onChange={(e) => setContingency(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="actions">
                  <button type="button" className="btn secondary" onClick={() => go(7)}>
                    ← Back: Finishing & Tiles
                  </button>
                  <button type="button" className="btn primary" onClick={handleCalculate}>
                    Calculate Complete Estimate
                  </button>
                </div>
              </section>
            )}
          </form>
        </section>

        {/* Results Section in Metric */}
        {showResult && calcData && (
          <section className="panel" id="result">
            <h2>Complete Construction Estimate (Metric BOQ)</h2>
            <p className="sub" id="resultTitle">
              {calcData.resultTitle}
            </p>
            <div className="summary">
              <div className="metric">
                <small>Total Built-up Area</small>
                <b id="rArea">{fmt(calcData.totalArea)} sq.m</b>
              </div>
              <div className="metric">
                <small>Excavation Volume</small>
                <b id="rExc">{fmt(calcData.excavation)} cu.m (m³)</b>
              </div>
              <div className="metric">
                <small>Total RCC Volume</small>
                <b id="rRcc">{fmt(calcData.rccCft)} cu.m (m³)</b>
              </div>
              <div className="metric">
                <small>Slab Concrete Volume</small>
                <b>{fmt(calcData.slabVolume)} cu.m (m³)</b>
              </div>
              <div className="metric">
                <small>Slab Formwork Area</small>
                <b>{fmt(calcData.slabFormworkArea)} sq.m</b>
              </div>
              <div className="metric">
                <small>Brickwork Volume</small>
                <b id="rBrickwork">{fmt(calcData.wallVol)} cu.m (m³)</b>
              </div>
              <div className="metric">
                <small>Openings Deducted</small>
                <b>{fmt(calcData.openingsArea)} sq.m</b>
              </div>
              <div className="metric">
                <small>Doors & Windows</small>
                <b>{calcData.doorCount}D / {calcData.windowCount}W / {calcData.ventCount}V</b>
              </div>
              <div className="metric">
                <small>Floor Tiles Area</small>
                <b>{fmt(calcData.calcFloorArea)} sq.m</b>
              </div>
              <div className="metric">
                <small>Wall Dado Tiles</small>
                <b>{fmt(calcData.calcWallTilesArea)} sq.m</b>
              </div>
              <div className="metric">
                <small>Cement Required</small>
                <b id="rCement">{fmt(calcData.cement)} bags</b>
              </div>
              <div className="metric">
                <small>Sand Required</small>
                <b id="rSand">{fmt(calcData.sand)} cu.m (m³)</b>
              </div>
              <div className="metric">
                <small>Aggregate Required</small>
                <b id="rAgg">{fmt(calcData.agg)} cu.m (m³)</b>
              </div>
              <div className="metric">
                <small>Reinforcement Steel</small>
                <b id="rSteel">{fmt(calcData.steel)} kg</b>
              </div>
              <div className="metric">
                <small>Total Bricks</small>
                <b id="rBricks">{fmt(calcData.brickQty)} pcs</b>
              </div>
              <div className="metric">
                <small>Plaster Area</small>
                <b id="rPlaster">{fmt(calcData.plasterArea)} sq.m</b>
              </div>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Work / Material Component</th>
                    <th>Calculated Quantity</th>
                    <th>Unit Rate (INR)</th>
                    <th>Estimated Amount (INR)</th>
                  </tr>
                </thead>
                <tbody id="costRows">
                  {calcData.items.map(([name, q, u, r], idx) => {
                    const amount = q * r;
                    return (
                      <tr key={idx}>
                        <td>{name}</td>
                        <td>
                          {fmt(q)} {u}
                        </td>
                        <td>{money(r)}</td>
                        <td>{money(amount)}</td>
                      </tr>
                    );
                  })}
                  <tr>
                    <td>Contingency Reserve ({fmt(calcData.contingencyRate)}%)</td>
                    <td>—</td>
                    <td>—</td>
                    <td>{money(calcData.contingencyVal)}</td>
                  </tr>
                  <tr>
                    <th colSpan={3}>Grand Total Project Cost</th>
                    <th>{money(calcData.grandTotal)}</th>
                  </tr>
                </tbody>
              </table>
            </div>

            <p style={{ margin: '20px 0 5px' }}>Estimated Total Project Cost</p>
            <div className="grand" id="grandTotal">
              {money(calcData.grandTotal)}
            </div>
            <p id="costPerSqft" className="sub">
              Approximate cost per built-up square meter: {money(calcData.costPerSqft)} / sq.m
            </p>

            <div className="note">
              <b>Engineering Note:</b> This preliminary planning estimate uses standard civil engineering volumetric formulas. All newly added architectural options (Floor Tiles, Wall Dado Tiles, Doors, Windows, Ventilators, and Slab Formwork) are itemized at their respective unit rates in the BOQ. Concrete dry-volume conversion factor 1.54 is utilized for RCC concrete (1 standard cement bag = 50 kg ~ 0.0347 m³), and mortar dry-volume factor 1.33 for brickwork and plastering. All openings are deducted from masonry and plastering. Always consult a licensed civil or structural engineer to review site conditions and structural drawings.
            </div>

            <div className="actions">
              <button
                className="btn secondary"
                onClick={() => {
                  setShowResult(false);
                  go(8);
                }}
              >
                ← Edit Rates
              </button>
              <button className="btn primary" onClick={() => window.print()}>
                Print / Save PDF Report
              </button>
            </div>
          </section>
        )}
      </main>

      <div className="footer" id="appFooter">
        BuildCost Pro · Complete Metric Construction Cost Estimator · All calculations run securely in your browser
      </div>
    </div>
  );
}
