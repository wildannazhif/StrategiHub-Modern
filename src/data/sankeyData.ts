export interface SankeyFlow {
  source: string;
  target: string;
  value: number;
  flights: number;
}

export const HUB_FLOWS: SankeyFlow[] = [
  {
    "source": "DPS (Bali)",
    "target": "CGK (Jakarta)",
    "value": 137133,
    "flights": 999
  },
  {
    "source": "CGK (Jakarta)",
    "target": "DPS (Bali)",
    "value": 129130,
    "flights": 985
  },
  {
    "source": "SUB (Surabaya)",
    "target": "CGK (Jakarta)",
    "value": 102041,
    "flights": 758
  },
  {
    "source": "CGK (Jakarta)",
    "target": "SUB (Surabaya)",
    "value": 100099,
    "flights": 744
  },
  {
    "source": "KNO (Medan)",
    "target": "CGK (Jakarta)",
    "value": 99801,
    "flights": 660
  },
  {
    "source": "CGK (Jakarta)",
    "target": "KNO (Medan)",
    "value": 95590,
    "flights": 666
  },
  {
    "source": "CGK (Jakarta)",
    "target": "UPG (Makassar)",
    "value": 89414,
    "flights": 677
  },
  {
    "source": "UPG (Makassar)",
    "target": "CGK (Jakarta)",
    "value": 66028,
    "flights": 669
  },
  {
    "source": "CGK (Jakarta)",
    "target": "PLM (Palembang)",
    "value": 61470,
    "flights": 415
  },
  {
    "source": "SUB (Surabaya)",
    "target": "DPS (Bali)",
    "value": 54750,
    "flights": 358
  },
  {
    "source": "CGK (Jakarta)",
    "target": "PKU (Pekanbaru)",
    "value": 53776,
    "flights": 399
  },
  {
    "source": "CGK (Jakarta)",
    "target": "BTH (Batam)",
    "value": 53095,
    "flights": 395
  },
  {
    "source": "DPS (Bali)",
    "target": "SUB (Surabaya)",
    "value": 51559,
    "flights": 368
  },
  {
    "source": "CGK (Jakarta)",
    "target": "YIA (Yogya)",
    "value": 49344,
    "flights": 373
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "CGK (Jakarta)",
    "value": 48252,
    "flights": 369
  },
  {
    "source": "CGK (Jakarta)",
    "target": "BPN (Balikpapan)",
    "value": 47141,
    "flights": 362
  },
  {
    "source": "CGK (Jakarta)",
    "target": "SRG (Semarang)",
    "value": 47130,
    "flights": 339
  },
  {
    "source": "CGK (Jakarta)",
    "target": "PDG (Padang)",
    "value": 45690,
    "flights": 333
  },
  {
    "source": "CGK (Jakarta)",
    "target": "BDJ (Banjarmasin)",
    "value": 45676,
    "flights": 327
  },
  {
    "source": "CGK (Jakarta)",
    "target": "PNK (Pontianak)",
    "value": 42363,
    "flights": 302
  },
  {
    "source": "SUB (Surabaya)",
    "target": "UPG (Makassar)",
    "value": 42002,
    "flights": 302
  },
  {
    "source": "CGK (Jakarta)",
    "target": "TKG (Lampung)",
    "value": 40208,
    "flights": 352
  },
  {
    "source": "CGK (Jakarta)",
    "target": "LOP (Lombok)",
    "value": 33196,
    "flights": 241
  },
  {
    "source": "SUB (Surabaya)",
    "target": "BDJ (Banjarmasin)",
    "value": 32194,
    "flights": 205
  },
  {
    "source": "UPG (Makassar)",
    "target": "SUB (Surabaya)",
    "value": 31517,
    "flights": 305
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "SUB (Surabaya)",
    "value": 30992,
    "flights": 210
  },
  {
    "source": "DPS (Bali)",
    "target": "LBJ (Labuan Bajo)",
    "value": 30711,
    "flights": 221
  },
  {
    "source": "CGK (Jakarta)",
    "target": "DJB (Jambi)",
    "value": 29283,
    "flights": 221
  },
  {
    "source": "SUB (Surabaya)",
    "target": "BPN (Balikpapan)",
    "value": 28957,
    "flights": 203
  },
  {
    "source": "CGK (Jakarta)",
    "target": "PGK (Pangkalpinang)",
    "value": 26129,
    "flights": 192
  },
  {
    "source": "SUB (Surabaya)",
    "target": "HLP (Halim)",
    "value": 25162,
    "flights": 217
  },
  {
    "source": "CGK (Jakarta)",
    "target": "SOC (Solo)",
    "value": 23901,
    "flights": 190
  },
  {
    "source": "DPS (Bali)",
    "target": "LOP (Lombok)",
    "value": 22859,
    "flights": 337
  },
  {
    "source": "CGK (Jakarta)",
    "target": "MDC (Manado)",
    "value": 21499,
    "flights": 156
  },
  {
    "source": "KNO (Medan)",
    "target": "BTH (Batam)",
    "value": 19802,
    "flights": 119
  },
  {
    "source": "SUB (Surabaya)",
    "target": "LOP (Lombok)",
    "value": 19161,
    "flights": 125
  },
  {
    "source": "CGK (Jakarta)",
    "target": "BKS (Bengkulu)",
    "value": 19117,
    "flights": 139
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "YIA (Yogya)",
    "value": 18483,
    "flights": 119
  },
  {
    "source": "UPG (Makassar)",
    "target": "KDI (Kendari)",
    "value": 18012,
    "flights": 160
  },
  {
    "source": "CGK (Jakarta)",
    "target": "BTJ (Banda Aceh)",
    "value": 17148,
    "flights": 134
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "UPG (Makassar)",
    "value": 16614,
    "flights": 119
  },
  {
    "source": "CGK (Jakarta)",
    "target": "DTB (Silangit)",
    "value": 15505,
    "flights": 112
  },
  {
    "source": "DPS (Bali)",
    "target": "UPG (Makassar)",
    "value": 15337,
    "flights": 118
  },
  {
    "source": "CGK (Jakarta)",
    "target": "AAP (Samarinda)",
    "value": 15170,
    "flights": 111
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "TRK (Tarakan)",
    "value": 14004,
    "flights": 106
  },
  {
    "source": "CGK (Jakarta)",
    "target": "KDI (Kendari)",
    "value": 13831,
    "flights": 101
  },
  {
    "source": "DPS (Bali)",
    "target": "YIA (Yogya)",
    "value": 13754,
    "flights": 116
  },
  {
    "source": "SUB (Surabaya)",
    "target": "BTH (Batam)",
    "value": 13414,
    "flights": 84
  },
  {
    "source": "SUB (Surabaya)",
    "target": "KOE (Kupang)",
    "value": 12647,
    "flights": 86
  },
  {
    "source": "UPG (Makassar)",
    "target": "YIA (Yogya)",
    "value": 12139,
    "flights": 111
  },
  {
    "source": "CGK (Jakarta)",
    "target": "TJQ (Belitung)",
    "value": 11769,
    "flights": 84
  },
  {
    "source": "SUB (Surabaya)",
    "target": "PNK (Pontianak)",
    "value": 11384,
    "flights": 72
  },
  {
    "source": "UPG (Makassar)",
    "target": "DPS (Bali)",
    "value": 11367,
    "flights": 118
  },
  {
    "source": "CGK (Jakarta)",
    "target": "AMQ (Ambon)",
    "value": 11134,
    "flights": 94
  },
  {
    "source": "DPS (Bali)",
    "target": "HLP (Halim)",
    "value": 10980,
    "flights": 105
  },
  {
    "source": "CGK (Jakarta)",
    "target": "PLW (Palu)",
    "value": 10969,
    "flights": 122
  },
  {
    "source": "UPG (Makassar)",
    "target": "BPN (Balikpapan)",
    "value": 10918,
    "flights": 117
  },
  {
    "source": "CGK (Jakarta)",
    "target": "KOE (Kupang)",
    "value": 10892,
    "flights": 96
  },
  {
    "source": "UPG (Makassar)",
    "target": "TTE (Ternate)",
    "value": 10254,
    "flights": 94
  },
  {
    "source": "SUB (Surabaya)",
    "target": "AAP (Samarinda)",
    "value": 9321,
    "flights": 65
  },
  {
    "source": "UPG (Makassar)",
    "target": "SOQ (Sorong)",
    "value": 9250,
    "flights": 83
  },
  {
    "source": "CGK (Jakarta)",
    "target": "LBJ (Labuan Bajo)",
    "value": 9144,
    "flights": 94
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "BEJ (Berau)",
    "value": 9131,
    "flights": 71
  },
  {
    "source": "UPG (Makassar)",
    "target": "TIM (Timika)",
    "value": 9095,
    "flights": 94
  },
  {
    "source": "CGK (Jakarta)",
    "target": "MLG (Malang)",
    "value": 8990,
    "flights": 73
  },
  {
    "source": "UPG (Makassar)",
    "target": "MDC (Manado)",
    "value": 8261,
    "flights": 85
  },
  {
    "source": "CGK (Jakarta)",
    "target": "TTE (Ternate)",
    "value": 8013,
    "flights": 58
  },
  {
    "source": "CGK (Jakarta)",
    "target": "SOQ (Sorong)",
    "value": 7688,
    "flights": 58
  },
  {
    "source": "UPG (Makassar)",
    "target": "PLW (Palu)",
    "value": 7621,
    "flights": 76
  },
  {
    "source": "CGK (Jakarta)",
    "target": "PKN (Pangkalan Bun)",
    "value": 7606,
    "flights": 63
  },
  {
    "source": "DPS (Bali)",
    "target": "TMC (Tambolaka)",
    "value": 7597,
    "flights": 59
  },
  {
    "source": "DPS (Bali)",
    "target": "BDO (Bandung)",
    "value": 7508,
    "flights": 52
  },
  {
    "source": "CGK (Jakarta)",
    "target": "DJJ (Jayapura)",
    "value": 7455,
    "flights": 64
  },
  {
    "source": "DPS (Bali)",
    "target": "KOE (Kupang)",
    "value": 7234,
    "flights": 52
  },
  {
    "source": "UPG (Makassar)",
    "target": "MOH (Morowali)",
    "value": 7041,
    "flights": 186
  },
  {
    "source": "SUB (Surabaya)",
    "target": "PKY (Palangkaraya)",
    "value": 7027,
    "flights": 44
  },
  {
    "source": "CGK (Jakarta)",
    "target": "PKY (Palangkaraya)",
    "value": 6925,
    "flights": 56
  },
  {
    "source": "CGK (Jakarta)",
    "target": "TNJ (Tanjungpinang)",
    "value": 6874,
    "flights": 56
  },
  {
    "source": "CGK (Jakarta)",
    "target": "GTO (Gorontalo)",
    "value": 6413,
    "flights": 73
  },
  {
    "source": "UPG (Makassar)",
    "target": "DJJ (Jayapura)",
    "value": 5859,
    "flights": 45
  },
  {
    "source": "DPS (Bali)",
    "target": "SRG (Semarang)",
    "value": 5231,
    "flights": 42
  },
  {
    "source": "SUB (Surabaya)",
    "target": "LBJ (Labuan Bajo)",
    "value": 4761,
    "flights": 32
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "SRG (Semarang)",
    "value": 4700,
    "flights": 33
  },
  {
    "source": "KNO (Medan)",
    "target": "GNS (Nias)",
    "value": 4679,
    "flights": 119
  },
  {
    "source": "KNO (Medan)",
    "target": "PKU (Pekanbaru)",
    "value": 4539,
    "flights": 30
  },
  {
    "source": "UPG (Makassar)",
    "target": "LUW (Luwuk)",
    "value": 4500,
    "flights": 61
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "BDJ (Banjarmasin)",
    "value": 4411,
    "flights": 107
  },
  {
    "source": "SUB (Surabaya)",
    "target": "PKN (Pangkalan Bun)",
    "value": 4348,
    "flights": 39
  },
  {
    "source": "KNO (Medan)",
    "target": "PLM (Palembang)",
    "value": 4283,
    "flights": 28
  },
  {
    "source": "UPG (Makassar)",
    "target": "AMQ (Ambon)",
    "value": 4137,
    "flights": 35
  },
  {
    "source": "UPG (Makassar)",
    "target": "MKW (Manokwari)",
    "value": 4014,
    "flights": 28
  },
  {
    "source": "CGK (Jakarta)",
    "target": "TRK (Tarakan)",
    "value": 3974,
    "flights": 28
  },
  {
    "source": "UPG (Makassar)",
    "target": "MKQ (Merauke)",
    "value": 3919,
    "flights": 31
  },
  {
    "source": "KNO (Medan)",
    "target": "BDO (Bandung)",
    "value": 3838,
    "flights": 35
  },
  {
    "source": "UPG (Makassar)",
    "target": "GTO (Gorontalo)",
    "value": 3680,
    "flights": 29
  },
  {
    "source": "KNO (Medan)",
    "target": "PDG (Padang)",
    "value": 3587,
    "flights": 28
  },
  {
    "source": "DPS (Bali)",
    "target": "SOC (Solo)",
    "value": 3476,
    "flights": 31
  },
  {
    "source": "DPS (Bali)",
    "target": "TIM (Timika)",
    "value": 3434,
    "flights": 30
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "BDO (Bandung)",
    "value": 3424,
    "flights": 28
  },
  {
    "source": "UPG (Makassar)",
    "target": "KXB (Kolaka)",
    "value": 3372,
    "flights": 119
  },
  {
    "source": "SUB (Surabaya)",
    "target": "MDC (Manado)",
    "value": 3342,
    "flights": 22
  },
  {
    "source": "CGK (Jakarta)",
    "target": "BWX (Banyuwangi)",
    "value": 3320,
    "flights": 26
  },
  {
    "source": "DPS (Bali)",
    "target": "BMU (Bima)",
    "value": 3234,
    "flights": 58
  },
  {
    "source": "DPS (Bali)",
    "target": "MDC (Manado)",
    "value": 3202,
    "flights": 27
  },
  {
    "source": "CGK (Jakarta)",
    "target": "LLJ (Lubuklinggau)",
    "value": 3198,
    "flights": 26
  },
  {
    "source": "KNO (Medan)",
    "target": "HLP (Halim)",
    "value": 3197,
    "flights": 27
  },
  {
    "source": "SUB (Surabaya)",
    "target": "BDO (Bandung)",
    "value": 3187,
    "flights": 29
  },
  {
    "source": "SUB (Surabaya)",
    "target": "AMQ (Ambon)",
    "value": 2815,
    "flights": 22
  },
  {
    "source": "KNO (Medan)",
    "target": "BTJ (Banda Aceh)",
    "value": 2764,
    "flights": 35
  },
  {
    "source": "UPG (Makassar)",
    "target": "NBX (Nabire)",
    "value": 2748,
    "flights": 31
  },
  {
    "source": "UPG (Makassar)",
    "target": "SRG (Semarang)",
    "value": 2643,
    "flights": 36
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "DPS (Bali)",
    "value": 2590,
    "flights": 19
  },
  {
    "source": "UPG (Makassar)",
    "target": "BUW (Baubau)",
    "value": 2588,
    "flights": 83
  },
  {
    "source": "DPS (Bali)",
    "target": "BPN (Balikpapan)",
    "value": 2493,
    "flights": 18
  },
  {
    "source": "SUB (Surabaya)",
    "target": "KDI (Kendari)",
    "value": 2269,
    "flights": 15
  },
  {
    "source": "UPG (Makassar)",
    "target": "BIK (Biak)",
    "value": 2249,
    "flights": 19
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "PNK (Pontianak)",
    "value": 2223,
    "flights": 18
  },
  {
    "source": "SUB (Surabaya)",
    "target": "PKU (Pekanbaru)",
    "value": 2203,
    "flights": 15
  },
  {
    "source": "DPS (Bali)",
    "target": "BDJ (Banjarmasin)",
    "value": 2072,
    "flights": 17
  },
  {
    "source": "SUB (Surabaya)",
    "target": "TRK (Tarakan)",
    "value": 2070,
    "flights": 15
  },
  {
    "source": "CGK (Jakarta)",
    "target": "BEJ (Berau)",
    "value": 2017,
    "flights": 18
  },
  {
    "source": "SUB (Surabaya)",
    "target": "SMQ (Sampit)",
    "value": 1948,
    "flights": 25
  },
  {
    "source": "SUB (Surabaya)",
    "target": "TTE (Ternate)",
    "value": 1942,
    "flights": 14
  },
  {
    "source": "DPS (Bali)",
    "target": "SWQ (Sumbawa)",
    "value": 1812,
    "flights": 30
  },
  {
    "source": "SUB (Surabaya)",
    "target": "PLW (Palu)",
    "value": 1709,
    "flights": 13
  },
  {
    "source": "SUB (Surabaya)",
    "target": "BEJ (Berau)",
    "value": 1681,
    "flights": 15
  },
  {
    "source": "UPG (Makassar)",
    "target": "LLO (Palopo)",
    "value": 1598,
    "flights": 47
  },
  {
    "source": "SUB (Surabaya)",
    "target": "PLM (Palembang)",
    "value": 1555,
    "flights": 12
  },
  {
    "source": "CGK (Jakarta)",
    "target": "DHX (Kediri)",
    "value": 1526,
    "flights": 15
  },
  {
    "source": "UPG (Makassar)",
    "target": "BDJ (Banjarmasin)",
    "value": 1501,
    "flights": 20
  },
  {
    "source": "UPG (Makassar)",
    "target": "KOE (Kupang)",
    "value": 1323,
    "flights": 14
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "MDC (Manado)",
    "value": 1276,
    "flights": 11
  },
  {
    "source": "DPS (Bali)",
    "target": "WGP (Waingapu)",
    "value": 1259,
    "flights": 22
  },
  {
    "source": "CGK (Jakarta)",
    "target": "SMQ (Sampit)",
    "value": 1197,
    "flights": 9
  },
  {
    "source": "UPG (Makassar)",
    "target": "MJU (Mamuju)",
    "value": 1197,
    "flights": 45
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "LOP (Lombok)",
    "value": 1186,
    "flights": 11
  },
  {
    "source": "CGK (Jakarta)",
    "target": "PSJ (Poso)",
    "value": 1137,
    "flights": 10
  },
  {
    "source": "DPS (Bali)",
    "target": "PNK (Pontianak)",
    "value": 938,
    "flights": 6
  },
  {
    "source": "UPG (Makassar)",
    "target": "LOP (Lombok)",
    "value": 912,
    "flights": 13
  },
  {
    "source": "KNO (Medan)",
    "target": "YIA (Yogya)",
    "value": 876,
    "flights": 5
  },
  {
    "source": "KNO (Medan)",
    "target": "FLZ (Sibolga)",
    "value": 782,
    "flights": 14
  },
  {
    "source": "SUB (Surabaya)",
    "target": "KNO (Medan)",
    "value": 762,
    "flights": 6
  },
  {
    "source": "SUB (Surabaya)",
    "target": "TIM (Timika)",
    "value": 753,
    "flights": 10
  },
  {
    "source": "UPG (Makassar)",
    "target": "BEJ (Berau)",
    "value": 665,
    "flights": 12
  },
  {
    "source": "SUB (Surabaya)",
    "target": "TMC (Tambolaka)",
    "value": 654,
    "flights": 9
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "LBW (Long Bawan)",
    "value": 605,
    "flights": 64
  },
  {
    "source": "KNO (Medan)",
    "target": "SUB (Surabaya)",
    "value": 568,
    "flights": 8
  },
  {
    "source": "UPG (Makassar)",
    "target": "LBJ (Labuan Bajo)",
    "value": 447,
    "flights": 20
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "GHS (Melak)",
    "value": 424,
    "flights": 10
  },
  {
    "source": "UPG (Makassar)",
    "target": "SQR (Soroako)",
    "value": 421,
    "flights": 17
  },
  {
    "source": "CGK (Jakarta)",
    "target": "WDB (Weda Bay)",
    "value": 399,
    "flights": 4
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "PLW (Palu)",
    "value": 379,
    "flights": 15
  },
  {
    "source": "KNO (Medan)",
    "target": "DJB (Jambi)",
    "value": 362,
    "flights": 5
  },
  {
    "source": "SUB (Surabaya)",
    "target": "BWX (Banyuwangi)",
    "value": 355,
    "flights": 16
  },
  {
    "source": "UPG (Makassar)",
    "target": "MOF (Maumere)",
    "value": 324,
    "flights": 13
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "MJU (Mamuju)",
    "value": 299,
    "flights": 11
  },
  {
    "source": "SUB (Surabaya)",
    "target": "SRG (Semarang)",
    "value": 269,
    "flights": 18
  },
  {
    "source": "DPS (Bali)",
    "target": "TQQ (Tomia)",
    "value": 241,
    "flights": 8
  },
  {
    "source": "CGK (Jakarta)",
    "target": "TIM (Timika)",
    "value": 223,
    "flights": 26
  },
  {
    "source": "KNO (Medan)",
    "target": "KJT (Kertajati)",
    "value": 210,
    "flights": 1
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "PKY (Palangkaraya)",
    "value": 183,
    "flights": 9
  },
  {
    "source": "UPG (Makassar)",
    "target": "BMU (Bima)",
    "value": 180,
    "flights": 10
  },
  {
    "source": "UPG (Makassar)",
    "target": "TRT (Toraja)",
    "value": 166,
    "flights": 9
  },
  {
    "source": "CGK (Jakarta)",
    "target": "HLP (Halim)",
    "value": 154,
    "flights": 11
  },
  {
    "source": "DPS (Bali)",
    "target": "WNI (Wakatobi)",
    "value": 154,
    "flights": 7
  },
  {
    "source": "SUB (Surabaya)",
    "target": "BXW (Bawean)",
    "value": 152,
    "flights": 18
  },
  {
    "source": "UPG (Makassar)",
    "target": "BTW (Batulicin)",
    "value": 136,
    "flights": 5
  },
  {
    "source": "CGK (Jakarta)",
    "target": "MOH (Morowali)",
    "value": 90,
    "flights": 1
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "MNA (Melonguane)",
    "value": 81,
    "flights": 3
  },
  {
    "source": "CGK (Jakarta)",
    "target": "LUW (Luwuk)",
    "value": 69,
    "flights": 1
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "LNU (Malinau)",
    "value": 46,
    "flights": 3
  },
  {
    "source": "KNO (Medan)",
    "target": "TXE (Takengon)",
    "value": 43,
    "flights": 5
  },
  {
    "source": "KNO (Medan)",
    "target": "GYO (Gayo Lues)",
    "value": 39,
    "flights": 5
  },
  {
    "source": "SUB (Surabaya)",
    "target": "BTJ (Banda Aceh)",
    "value": 9,
    "flights": 1
  },
  {
    "source": "UPG (Makassar)",
    "target": "HLP (Halim)",
    "value": 9,
    "flights": 13
  },
  {
    "source": "BPN (Balikpapan)",
    "target": "HLP (Halim)",
    "value": 6,
    "flights": 10
  },
  {
    "source": "KNO (Medan)",
    "target": "DUM (Dumai)",
    "value": 5,
    "flights": 1
  },
  {
    "source": "SUB (Surabaya)",
    "target": "WGP (Waingapu)",
    "value": 5,
    "flights": 1
  },
  {
    "source": "SUB (Surabaya)",
    "target": "DHX (Kediri)",
    "value": 3,
    "flights": 2
  },
  {
    "source": "UPG (Makassar)",
    "target": "BXB (Babo)",
    "value": 2,
    "flights": 2
  },
  {
    "source": "SUB (Surabaya)",
    "target": "BTW (Batulicin)",
    "value": 1,
    "flights": 1
  }
];

export const ISLAND_FLOWS: SankeyFlow[] = [
  { source: 'Jawa', target: 'Jawa', value: 527628, flights: 4190 },
  { source: 'Jawa', target: 'Sumatera', value: 487319, flights: 3626 },
  { source: 'Sumatera', target: 'Jawa', value: 480967, flights: 3637 },
  { source: 'Bali & Nusra', target: 'Jawa', value: 330415, flights: 2444 },
  { source: 'Jawa', target: 'Bali & Nusra', value: 318222, flights: 2381 },
  { source: 'Kalimantan', target: 'Jawa', value: 310713, flights: 2185 },
  { source: 'Jawa', target: 'Kalimantan', value: 305976, flights: 2192 },
  { source: 'Jawa', target: 'Sulawesi', value: 209253, flights: 1634 },
  { source: 'Bali & Nusra', target: 'Bali & Nusra', value: 175902, flights: 2036 },
  { source: 'Sulawesi', target: 'Jawa', value: 172237, flights: 1634 },
  { source: 'Sumatera', target: 'Sumatera', value: 151204, flights: 1059 },
  { source: 'Sulawesi', target: 'Sulawesi', value: 91749, flights: 749 },
  { source: 'Jawa', target: 'Lainnya', value: 74544, flights: 836 },
  { source: 'Lainnya', target: 'Jawa', value: 74473, flights: 825 },
  { source: 'Maluku & Papua', target: 'Sulawesi', value: 65983, flights: 591 },
  { source: 'Maluku & Papua', target: 'Maluku & Papua', value: 63851, flights: 643 },
  { source: 'Kalimantan', target: 'Kalimantan', value: 63515, flights: 696 },
  { source: 'Sulawesi', target: 'Maluku & Papua', value: 60445, flights: 618 },
  { source: 'Lainnya', target: 'Sulawesi', value: 44416, flights: 832 },
  { source: 'Maluku & Papua', target: 'Lainnya', value: 42429, flights: 3198 },
  { source: 'Jawa', target: 'Maluku & Papua', value: 40257, flights: 350 },
  { source: 'Lainnya', target: 'Maluku & Papua', value: 39920, flights: 3270 },
  { source: 'Maluku & Papua', target: 'Jawa', value: 36486, flights: 309 },
  { source: 'Sulawesi', target: 'Lainnya', value: 35313, flights: 843 },
];

export const SANKEY_COLOR_MAP: Record<string, string> = {
  // Airports
  'CGK (Jakarta)': '#2563eb',
  'SUB (Surabaya)': '#0d9488',
  'DPS (Bali)': '#f59e0b',
  'UPG (Makassar)': '#10b981',
  'KNO (Medan)': '#8b5cf6',
  'BPN (Balikpapan)': '#ec4899',
  'BTH (Batam)': '#06b6d4',
  'YIA (Yogya)': '#6366f1',
  'BDJ (Banjarmasin)': '#14b8a6',
  'LOP (Lombok)': '#f97316',
  'PLM (Palembang)': '#84cc16',
  'PKU (Pekanbaru)': '#a855f7',
  'PDG (Padang)': '#3b82f6',
  'PNK (Pontianak)': '#eab308',
  'SRG (Semarang)': '#64748b',
  'MDC (Manado)': '#ef4444',
  'TKG (TKG)': '#0284c7',
  'DJB (DJB)': '#059669',
  'PGK (PGK)': '#d97706',
  'HLP (HLP)': '#475569',
  'SOC (SOC)': '#7c3aed',
  'LBJ (LBJ)': '#db2777',
  'BKS (BKS)': '#65a30d',
  'KDI (KDI)': '#0891b2',
  'BTJ (BTJ)': '#4f46e5',
  'DTB (DTB)': '#9333ea',
  'AAP (AAP)': '#c026d3',
  'TRK (TRK)': '#ea580c',
  'KOE (KOE)': '#16a34a',
  'TJQ (TJQ)': '#2563eb',
  'AMQ (AMQ)': '#dc2626',
  'PLW (PLW)': '#0284c7',
  'TTE (TTE)': '#7c2d12',

  // Island Groups
  'Jawa': '#3b82f6',
  'Sumatera': '#10b981',
  'Bali & Nusra': '#f59e0b',
  'Kalimantan': '#ec4899',
  'Sulawesi': '#8b5cf6',
  'Maluku & Papua': '#06b6d4',
  'Lainnya': '#94a3b8',
};
