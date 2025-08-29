import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { countArea, createParkInfo, clock } from "./api/DataApi";

// 아이콘 (Font Awesome 6)
import {
  FaWheelchair, // 장애인석
  FaPersonPregnant, // 임산부석
  FaChargingStation, // 전기차
  FaCarSide, // 경차
} from "react-icons/fa6";

// ✅ 배경 슬라이드용 이미지 3장
import parking1 from "./assets/a.jpg";
import parking2 from "./assets/b.jpg";
import parking3 from "./assets/c.jpg";

/* ----------------------- 배경 슬라이더 ----------------------- */
const BackgroundSlider = ({ images, interval = 6000, mode = "fixed" }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  const pos = mode === "fixed" ? "fixed" : "absolute";

  return (
    <div className={`${pos} inset-0 -z-10`}>
      {images.map((src, i) => (
        <div
          key={src}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className="h-full w-full bg-center bg-cover"
            style={{ backgroundImage: `url(${src})` }}
          />
          <div className="absolute inset-0 bg-neutral-100/70 backdrop-blur-[1px]" />
        </div>
      ))}
    </div>
  );
};
/* -------------------------------------------------------------- */

/* ---------------------------- Modal ---------------------------- */
function Modal({ open, onClose, title, children }) {
  // ESC 닫기 + 바디 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {title && <h2 className="mb-2 text-xl font-bold">{title}</h2>}
        <div className="text-gray-700">{children}</div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-900 px-4 py-2 text-white hover:bg-black"
          >
            확인
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
/* -------------------------------------------------------------- */

// 타입 메타(아이콘/색)
const TYPE_META = {
  장애인석: {
    icon: <FaWheelchair className="w-5 h-5" />,
    bg: "bg-blue-600",
    ring: "ring-blue-300",
    label: "장애인석",
  },
  임산부석: {
    icon: <FaPersonPregnant className="w-5 h-5" />,
    bg: "bg-pink-600",
    ring: "ring-pink-300",
    label: "임산부석",
  },
  전기차: {
    icon: <FaChargingStation className="w-5 h-5" />,
    bg: "bg-emerald-600",
    ring: "ring-emerald-300",
    label: "전기차",
  },
  경차: {
    icon: <FaCarSide className="w-5 h-5" />,
    bg: "bg-yellow-600",
    ring: "ring-yellow-300",
    label: "경차",
  },
  일반: null,
};

const SECTORS = ["A", "B", "C", "D", "E"];

const Data = () => {
  const [originparkingTypes, setOriginparkingTypes] = useState([]);
  const [currentTime, setCurrentTime] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [selectedSector, setSelectedSector] = useState(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [search, setSearch] = useState("");

  const [welcomeOpen, setWelcomeOpen] = useState(
    () => !sessionStorage.getItem("parking_welcome_seen")
  );
  // 확인 눌렀을 때 닫고, 그 때 세션에 기록
  const closeWelcome = () => {
    setWelcomeOpen(false);
    sessionStorage.setItem("parking_welcome_seen", "1");
  };

  // 초기 데이터 & 시계
  useEffect(() => {
    const initial = createParkInfo();
    setOriginparkingTypes(initial);

    const timer = setInterval(() => {
      const t = new Date();
      const hh = String(t.getHours()).padStart(2, "0");
      const mm = String(t.getMinutes()).padStart(2, "0");
      const ss = String(t.getSeconds()).padStart(2, "0");
      setCurrentTime(`${hh}:${mm}:${ss}`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const typeCountsAll = useMemo(
    () => countArea(originparkingTypes),
    [originparkingTypes]
  );

  const summary = useMemo(() => {
    const total = originparkingTypes.length;
    const available = originparkingTypes.filter((s) => s.parkable).length;
    const occupied = total - available;
    const rate = total ? Math.round((occupied / total) * 100) : 0;
    return { total, available, occupied, rate };
  }, [originparkingTypes]);

  const sectorStats = useMemo(() => {
    const map = {};
    SECTORS.forEach((sec) => {
      const all = originparkingTypes.filter((s) => s.sector === sec);
      const total = all.length;
      const available = all.filter((s) => s.parkable).length;
      const occupied = total - available;
      const rate = total ? Math.round((occupied / total) * 100) : 0;
      map[sec] = { total, available, occupied, rate };
    });
    return map;
  }, [originparkingTypes]);

  const displayed = useMemo(() => {
    return originparkingTypes
      .filter((s) => (selectedType ? s.type === selectedType : true))
      .filter((s) => (selectedSector ? s.sector === selectedSector : true))
      .filter((s) => (onlyAvailable ? s.parkable : true))
      .filter((s) =>
        search.trim()
          ? s.carNumber.toLowerCase().includes(search.toLowerCase())
          : true
      );
  }, [originparkingTypes, selectedType, selectedSector, onlyAvailable, search]);

  const SpotCard = ({ spot }) => {
    const meta = TYPE_META[spot.type];
    return (
      <div
        className={`relative group flex flex-col items-center justify-center h-24 w-16 rounded-2xl shadow-md transition-transform duration-150 hover:scale-110 hover:z-10 ${
          spot.parkable ? "bg-emerald-500" : "bg-red-500"
        } ${meta?.ring ?? ""} ring-2`}
      >
        {meta && (
          <div
            className={`absolute top-1.5 left-1.5 ${meta.bg} text-white rounded-full p-1.5 shadow ring-2 ring-white/60`}
            title={spot.type}
            aria-label={spot.type}
          >
            {meta.icon}
          </div>
        )}

        <span className="font-extrabold text-white text-lg mt-1">
          {spot.id}
        </span>

        <div className="absolute bottom-full mb-2 w-max px-3 py-2 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <p>
            구역: {spot.sector}-{spot.id}
          </p>
          <p>타입: {spot.type}</p>
          <p>상태: {spot.parkable ? "주차 가능" : "주차 중"}</p>
          {!spot.parkable && <p>차량번호: {spot.carNumber}</p>}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
        </div>
      </div>
    );
  };

  const Chip = ({ active, onClick, children }) => (
    <button
      className={`px-3 py-1.5 rounded-full text-sm border transition ${
        active
          ? "bg-gray-900 text-white border-gray-900"
          : "bg-white/80 text-gray-700 border-gray-300 hover:bg-gray-100"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );

  const Legend = () => (
    <div className="flex flex-wrap gap-2">
      {Object.entries(TYPE_META)
        .filter(([k]) => k !== "일반")
        .map(([key, meta]) => (
          <div key={key} className="flex items-center gap-1.5 text-sm">
            <span
              className={`inline-flex items-center justify-center ${meta.bg} text-white rounded-full w-6 h-6`}
            >
              {meta.icon}
            </span>
            <span className="text-gray-700">{meta.label}</span>
            <span className="ml-2 text-xs text-gray-500">
              {typeCountsAll[key]}석 가용
            </span>
          </div>
        ))}
    </div>
  );

  return (
    <div className="relative min-h-screen font-sans">
      {/* 🔻 배경 슬라이드 */}
      <BackgroundSlider
        images={[parking1, parking2, parking3]}
        interval={6000}
        mode="fixed"
      />

      {/* 상단 헤더 */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                실시간 주차 관리
              </h1>
              <p className="text-sm text-gray-600">
                {clock()} • <span className="font-medium">{currentTime}</span>{" "}
                기준
              </p>
            </div>

            {/* KPI 카드 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow">
                <div className="text-xs text-gray-500">전체</div>
                <div className="text-lg font-bold text-gray-900">
                  {summary.total}면
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow">
                <div className="text-xs text-gray-500">가용</div>
                <div className="text-lg font-bold text-emerald-700">
                  {summary.available}면
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow">
                <div className="text-xs text-gray-500">점유</div>
                <div className="text-lg font-bold text-red-600">
                  {summary.occupied}면
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow">
                <div className="text-xs text-gray-500">점유율</div>
                <div className="text-lg font-bold text-gray-900">
                  {summary.rate}%
                </div>
                <div className="mt-1 h-1 w-full bg-gray-200 rounded">
                  <div
                    className="h-1 bg-red-500 rounded"
                    style={{ width: `${summary.rate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 필터 바 */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* 타입 필터 */}
            <div className="flex flex-wrap items-center gap-2">
              <Chip
                active={selectedType === null}
                onClick={() => setSelectedType(null)}
              >
                전체
              </Chip>
              {["일반", "장애인석", "임산부석", "전기차", "경차"].map((t) => (
                <Chip
                  key={t}
                  active={selectedType === t}
                  onClick={() => setSelectedType(t)}
                >
                  {t}
                </Chip>
              ))}
            </div>

            {/* 섹터 필터 */}
            <div className="ml-auto flex items-center gap-2">
              <Chip
                active={selectedSector === null}
                onClick={() => setSelectedSector(null)}
              >
                전체 구역
              </Chip>
              {SECTORS.map((sec) => (
                <Chip
                  key={sec}
                  active={selectedSector === sec}
                  onClick={() => setSelectedSector(sec)}
                >
                  {sec}구역
                </Chip>
              ))}
            </div>
          </div>

          {/* 보조 컨트롤 */}
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                checked={onlyAvailable}
                onChange={(e) => setOnlyAvailable(e.target.checked)}
              />
              빈 자리만 보기
            </label>

            <div className="relative">
              <input
                type="text"
                placeholder="차량번호 검색 (예: 1234)"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white/90 backdrop-blur px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/20"
              />
            </div>

            <div className="ml-auto">
              <Legend />
            </div>
          </div>
        </div>
      </header>

      {/* 본문 */}
      <main className="mx-auto max-w-7xl px-6 py-6">
        {(selectedSector ? [selectedSector] : SECTORS).map((sec) => {
          const list = displayed.filter((s) => s.sector === sec);
          const stat = sectorStats[sec];
          return (
            <section key={sec} className="mb-8">
              <div className="mb-3 flex items-end justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {sec} 구역
                  </h2>
                  <p className="text-sm text-gray-600">
                    가용 {stat.available} / 전체 {stat.total} (점유율{" "}
                    {stat.rate}%)
                  </p>
                </div>
                <div className="w-44 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500"
                    style={{ width: `${stat.rate}%` }}
                  />
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow">
                {list.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    표시할 자리가 없습니다.
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-8 grid-cols-5">
                    {list.map((spot) => (
                      <SpotCard key={spot.id} spot={spot} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </main>

      {/* ✅ 처음 화면 모달 */}
      <Modal open={welcomeOpen} onClose={closeWelcome} title="안내">
        <p>
          나신영 , 이건호, 전재석님 프로젝트를 AI 가 생성한 코드를 수정없이
          사용한 WEB 페이지 입니다. 이것을 참고하셔서 메뉴 및 아이디어
          구현하세요
        </p>
      </Modal>
    </div>
  );
};

export default Data;
