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

  // Stepper state (0 to 7)
  // 0: Project, 1: Excavation, 2: Footings, 3: Columns, 4: RCC Superstructure, 5: Walls & Rooms, 6: Finishing, 7: Rates
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

  // Additional Foundation Trench Excavation (optional)
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

  // Step 5: RCC Superstructure (Beams & Slabs)
  const [beamLength, setBeamLength] = useState<number>(50); // running meters
  const [beamW, setBeamW] = useState<number>(0.23); // meters
  const [beamD, setBeamD] = useState<number>(0.30); // meters
  const [slab, setSlab] = useState<number>(0.125);  // meters (125 mm)
  const [mixC, setMixC] = useState<number>(1);
  const [mixS, setMixS] = useState<number>(2);
  const [mixA, setMixA] = useState<number>(4);
  const [steelFactor, setSteelFactor] = useState<number>(100); // kg / m³ RCC
  const [miscRcc, setMiscRcc] = useState<number>(0); // m³

  // Step 6: Walls, Rooms, Doors & Windows
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
  const [doors, setDoors] = useState<number>(5);
  const [doorSize, setDoorSize] = useState<string>('0.9 x 2.1'); // width x height (m)
  const [windows, setWindows] = useState<number>(6);
  const [windowSize, setWindowSize] = useState<string>('1.2 x 1.2'); // width x height (m)
  const [vents, setVents] = useState<number>(3);
  const [ventSize, setVentSize] = useState<string>('0.6 x 0.45'); // width x height (m)
  const [mortarC, setMortarC] = useState<number>(1);
  const [mortarS, setMortarS] = useState<number>(6);
  const [brickFactor, setBrickFactor] = useState<number>(500); // bricks per cu.m of brickwork

  // Step 7: Finishing, Electrical & Plumbing
  const [floorArea, setFloorArea] = useState<number>(0); // sq.m (0 = built-up area)
  const [plasterSides, setPlasterSides] = useState<number>(2); // 1 or 2
  const [plasterThick, setPlasterThick] = useState<number>(12); // mm
  const [paintCoats, setPaintCoats] = useState<number>(2);
  const [electricalPoints, setElectricalPoints] = useState<number>(25);
  const [plumbingFixtures, setPlumbingFixtures] = useState<number>(10);
  const [waterproofArea, setWaterproofArea] = useState<number>(10); // sq.m

  // Step 8: Material & Labour Rates (in Metric Units)
  const [cementRate, setCementRate] = useState<number>(380); // ₹ / 50kg bag
  const [sandRate, setSandRate] = useState<number>(1900); // ₹ / cu.m
  const [aggRate, setAggRate] = useState<number>(1750); // ₹ / cu.m
  const [steelRate, setSteelRate] = useState<number>(65); // ₹ / kg
  const [brickRate, setBrickRate] = useState<number>(8); // ₹ / piece
  const [excRate, setExcRate] = useState<number>(400); // ₹ / cu.m
  const [labourRate, setLabourRate] = useState<number>(2700); // ₹ / sq.m built-up
  const [floorRate, setFloorRate] = useState<number>(950); // ₹ / sq.m
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
    paintArea: number; // sq.m
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

  const sizeArea = (str: string) => {
    if (!str) return 0;
    const m = str.toLowerCase().split(/[x×*]/).map((x) => Number(x.trim()));
    return m.length >= 2 && m.every((x) => !isNaN(x) && x > 0) ? m[0] * m[1] : 0;
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

    // Slab RCC (m³)
    const slabVol = builtArea * (Number(slab) || 0);

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

    // Brickwork & Walls (m³)
    const openingsArea =
      (Number(doors) || 0) * sizeArea(doorSize) +
      (Number(windows) || 0) * sizeArea(windowSize) +
      (Number(vents) || 0) * sizeArea(ventSize);

    const grossWallArea = (Number(wallLength) || 0) * (Number(wallHeight) || 0) * fCount;
    const netWallArea = Math.max(0, grossWallArea - openingsArea);
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

    // Flooring & Plastering
    const customFloorArea = Number(floorArea) || totalBuiltArea;
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

    // BOQ Item list in Metric Units
    const items: [string, number, string, number][] = [
      ['Cement', cementTotalBags, 'bags (50kg)', Number(cementRate) || 0],
      ['Sand', sandTotal, 'cu.m (m³)', Number(sandRate) || 0],
      ['Aggregate / Coarse Gravel', aggTotal, 'cu.m (m³)', Number(aggRate) || 0],
      ['Reinforcement Steel', steelTotal, 'kg', Number(steelRate) || 0],
      ['Bricks', brickTotal, 'pieces', Number(brickRate) || 0],
      ['Excavation', excavation, 'cu.m (m³)', Number(excRate) || 0],
      ['Construction Labour', totalBuiltArea, 'sq.m', Number(labourRate) || 0],
      ['Flooring', customFloorArea, 'sq.m', Number(floorRate) || 0],
      ['Plastering', plasterArea, 'sq.m', Number(plasterRate) || 0],
      ['Painting (coat-area)', paintArea, 'sq.m', Number(paintRate) || 0],
      ['Electrical Points', Number(electricalPoints) || 0, 'points', Number(electricalRate) || 0],
      ['Plumbing Fixtures', Number(plumbingFixtures) || 0, 'fixtures', Number(plumbingRate) || 0],
      ['Waterproofing', Number(waterproofArea) || 0, 'sq.m', Number(waterproofRate) || 0],
      ['Miscellaneous / Finishing', 1, 'lump sum', Number(miscRate) || 0],
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
      paintArea,
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
            Professional engineering cost calculation with dedicated steps for Excavation, Footings, Columns, RCC superstructure, walls, finishes, and rates in standard Metric units (meters, m², m³).
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
              5. Beams & Slab
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
              7. Finishing
            </div>
            <div
              className={`step ${currentStep === 7 ? 'active' : ''}`}
              onClick={() => go(7)}
            >
              8. Rates
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

            {/* Step 1: Excavation (Dedicated Separate Option) */}
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
                    Next: Beams & Slab →
                  </button>
                </div>
              </section>
            )}

            {/* Step 4: RCC Superstructure (Beams & Slab) */}
            {currentStep === 4 && (
              <section className="page" data-page="4">
                <h2>RCC Superstructure (Beams & Slab)</h2>
                <p className="sub">Enter plinth/roof beam lengths, slab thickness, concrete mix design, and steel factor.</p>
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
                    <label>Slab Thickness (meters)</label>
                    <input
                      id="slab"
                      type="number"
                      min={0}
                      step=".005"
                      value={slab}
                      onChange={(e) => setSlab(Number(e.target.value))}
                    />
                    <div className="unit">e.g. 0.125 m (125 mm / 5 inches)</div>
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

            {/* Step 5: Walls, Rooms, Doors & Windows */}
            {currentStep === 5 && (
              <section className="page" data-page="5">
                <h2>Rooms, Walls, Doors & Windows</h2>
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
                    <label>Door Quantity (Nos.)</label>
                    <input
                      id="doors"
                      type="number"
                      min={0}
                      value={doors}
                      onChange={(e) => setDoors(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Door Size (width × height in meters)</label>
                    <input
                      id="doorSize"
                      value={doorSize}
                      onChange={(e) => setDoorSize(e.target.value)}
                    />
                    <div className="unit">Standard: 0.9 x 2.1 m</div>
                  </div>
                  <div className="field">
                    <label>Window Quantity (Nos.)</label>
                    <input
                      id="windows"
                      type="number"
                      min={0}
                      value={windows}
                      onChange={(e) => setWindows(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Window Size (width × height in meters)</label>
                    <input
                      id="windowSize"
                      value={windowSize}
                      onChange={(e) => setWindowSize(e.target.value)}
                    />
                    <div className="unit">Standard: 1.2 x 1.2 m</div>
                  </div>
                  <div className="field">
                    <label>Ventilator Quantity (Nos.)</label>
                    <input
                      id="vents"
                      type="number"
                      min={0}
                      value={vents}
                      onChange={(e) => setVents(Number(e.target.value))}
                    />
                  </div>
                  <div className="field">
                    <label>Ventilator Size (width × height in meters)</label>
                    <input
                      id="ventSize"
                      value={ventSize}
                      onChange={(e) => setVentSize(e.target.value)}
                    />
                    <div className="unit">Standard: 0.6 x 0.45 m</div>
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
                    ← Back: Beams & Slab
                  </button>
                  <button type="button" className="btn primary" onClick={() => go(6)}>
                    Next: Finishing →
                  </button>
                </div>
              </section>
            )}

            {/* Step 6: Finishing, Electrical & Plumbing */}
            {currentStep === 6 && (
              <section className="page" data-page="6">
                <h2>Finishing, Electrical & Plumbing</h2>
                <p className="sub">Enter plastering, flooring, paint coats, and MEP quantities in metric units.</p>
                <div className="grid">
                  <div className="field">
                    <label>Flooring Area (sq.m; 0 = auto built-up area)</label>
                    <input
                      id="floorArea"
                      type="number"
                      min={0}
                      step=".5"
                      value={floorArea}
                      onChange={(e) => setFloorArea(Number(e.target.value))}
                    />
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
                  <button type="button" className="btn secondary" onClick={() => go(5)}>
                    ← Back: Walls & Rooms
                  </button>
                  <button type="button" className="btn primary" onClick={() => go(7)}>
                    Next: Rates →
                  </button>
                </div>
              </section>
            )}

            {/* Step 7: Material & Labour Rates */}
            {currentStep === 7 && (
              <section className="page" data-page="7">
                <h2>Material & Labour Rates (Metric Units)</h2>
                <p className="sub">Enter market rates in Indian Rupees (₹) per standard metric unit.</p>
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
                    <div className="unit">Standard river/manufactured sand rate per m³</div>
                  </div>
                  <div className="field">
                    <label>Aggregate / Coarse Gravel (₹ / cu.m / m³)</label>
                    <input
                      id="aggRate"
                      type="number"
                      min={0}
                      value={aggRate}
                      onChange={(e) => setAggRate(Number(e.target.value))}
                    />
                    <div className="unit">Standard blue metal gravel per m³</div>
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
                  <div className="field">
                    <label>Labour - Construction (₹ / sq.m built-up)</label>
                    <input
                      id="labourRate"
                      type="number"
                      min={0}
                      value={labourRate}
                      onChange={(e) => setLabourRate(Number(e.target.value))}
                    />
                    <div className="unit">Civil structure labour rate per m²</div>
                  </div>
                  <div className="field">
                    <label>Flooring (₹ / sq.m)</label>
                    <input
                      id="floorRate"
                      type="number"
                      min={0}
                      value={floorRate}
                      onChange={(e) => setFloorRate(Number(e.target.value))}
                    />
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
                    <label>Miscellaneous / Finishing (₹ Lump sum)</label>
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
                  <button type="button" className="btn secondary" onClick={() => go(6)}>
                    ← Back: Finishing
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
                <small>Brickwork Volume</small>
                <b id="rBrickwork">{fmt(calcData.wallVol)} cu.m (m³)</b>
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
              <div className="metric">
                <small>Flooring Area</small>
                <b id="rFloor">{fmt(calcData.calcFloorArea)} sq.m</b>
              </div>
              <div className="metric">
                <small>Paint Area</small>
                <b id="rPaint">{fmt(calcData.paintArea)} sq.m</b>
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
              <b>Engineering Note:</b> This is a preliminary planning estimate calculated with standard civil engineering volumetric formulas, not a final structural design or tender contract BOQ. Concrete dry-volume conversion factor 1.54 is utilized for RCC concrete (1 standard cement bag = 50 kg ~ 0.0347 m³), mortar dry-volume factor 1.33 for brickwork and plastering. Steel consumption (kg/m³), brick count (pcs/m³), and material rates are fully customizable assumptions. Total wall lengths include external and internal partition walls without double-counting shared partitions. Openings are deducted based on provided width and height. Always consult a licensed civil or structural engineer to review foundation soil bearing capacity, structural drawings, bar bending schedules, and local site conditions.
            </div>

            <div className="actions">
              <button
                className="btn secondary"
                onClick={() => {
                  setShowResult(false);
                  go(7);
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
