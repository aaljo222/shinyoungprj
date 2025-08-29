// src/api/DataApi.js

// 랜덤 차량번호 생성
export function generateCarNumber() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = Math.floor(1000 + Math.random() * 9000); // 1000~9999
  const chars =
    letters.charAt(Math.floor(Math.random() * letters.length)) +
    letters.charAt(Math.floor(Math.random() * letters.length));
  return numbers.toString() + chars;
}

// 주차 가능 여부 랜덤
export function randomBoolean() {
  return Math.random() < 0.5;
}

// 타입별/전체 주차 가능 자리 수 집계
export function countArea(arr) {
  return arr.reduce(
    (counts, item) => {
      if (item.parkable) {
        counts.전체 += 1;
        counts[item.type] = (counts[item.type] || 0) + 1;
      }
      return counts;
    },
    { 전체: 0, 일반: 0, 임산부석: 0, 장애인석: 0, 전기차: 0, 경차: 0 }
  );
}

// 랜덤 주차장 데이터 생성
export function createParkInfo() {
  const parkingTypes = [];

  for (let i = 1; i <= 100; i++) {
    // sector 결정
    let sector = "";
    if (i <= 20) sector = "A";
    else if (i <= 40) sector = "B";
    else if (i <= 60) sector = "C";
    else if (i <= 80) sector = "D";
    else sector = "E";

    // type 결정
    let type = "일반";
    if (i > 95) type = "장애인석"; // 96~100
    else if (i > 90) type = "임산부석"; // 91~95
    else if (i > 80) type = "경차"; // 81~90
    else if (i > 70) type = "전기차"; // 71~80

    parkingTypes.push({
      id: i,
      sector,
      type,
      carNumber: generateCarNumber(),
      parkable: randomBoolean(),
    });
  }
  return parkingTypes;
}

// YYYY-MM-DD
export function clock() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
