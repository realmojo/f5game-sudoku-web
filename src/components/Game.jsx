import React, { useState, useEffect, useCallback } from "react";
import { Modal, Button, Col, Row } from "antd";
import "./Home.css";
import { faEraser, faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useParams } from "react-router-dom";
import { easy } from "./assets/easy";
import { normal } from "./assets/normal";
import { hard } from "./assets/hard";
import { crazy } from "./assets/crazy";

const isNumber = (s) => {
  s += ""; // 문자열로 변환
  s = s.replace(/^\s*|\s*$/g, ""); // 좌우 공백 제거
  if (s === "" || isNaN(s)) return false;
  return true;
};
const getWHIndex = (x, y) => {
  x = Number(x);
  y = Number(y);
  const xHeightIndex = [x, (x + 3) % 9, (x + 6) % 9].sort();
  const yHeightIndex = [y, (y + 3) % 9, (y + 6) % 9].sort();

  let xWidthIndex = [];
  let yWidthIndex = [];

  if (x >= 0 && x <= 2) {
    xWidthIndex = [0, 1, 2];
  } else if (x >= 3 && x <= 5) {
    xWidthIndex = [3, 4, 5];
  } else if (x >= 6 && x <= 8) {
    xWidthIndex = [6, 7, 8];
  }
  if (y >= 0 && y <= 2) {
    yWidthIndex = [0, 1, 2];
  } else if (y >= 3 && y <= 5) {
    yWidthIndex = [3, 4, 5];
  } else if (y >= 6 && y <= 8) {
    yWidthIndex = [6, 7, 8];
  }
  return {
    xHeightIndex,
    yHeightIndex,
    xWidthIndex,
    yWidthIndex,
  };
};

export const Game = () => {
  const { type } = useParams();

  const [gameClearModalVisible, setGameClearModalVisible] = useState(false);
  const [gameClearModalButtonVisible, setGameClearModalButtonVisible] =
    useState(false);
  const [board, setBoard] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [currX, setCurrX] = useState(-1);
  const [currY, setCurrY] = useState(-1);
  const [dangerXYs, setDangerXYs] = useState([]);
  const [boardHeight, setBoardHeight] = useState(604);

  const [level, setLevel] = useState(
    localStorage.getItem(`sudoku-${type}`)
      ? localStorage.getItem(`sudoku-${type}`)
      : 1
  );

  const doDangerCheck = (x, y, number, newBoard) => {
    const { xHeightIndex, yHeightIndex, xWidthIndex, yWidthIndex } = getWHIndex(
      x,
      y
    );
    x = Number(x);
    y = Number(y);
    number = Number(number);
    let result = false;
    const _board = newBoard ? newBoard : board;

    // 정사각형 체크
    for (let j = 0; j < 9; j++) {
      if (j !== y && _board[x][j].number === number) {
        result = true;
      }
    }

    // 가로 체크
    for (const _x of xWidthIndex) {
      for (const _y of yWidthIndex) {
        if (x === _x && y === _y) {
          continue;
        }
        if (_board[_x][_y].number === number) {
          result = true;
        }
      }
    }

    // 세로 체크
    for (const _x of xHeightIndex) {
      for (const _y of yHeightIndex) {
        if (x === _x && y === _y) {
          continue;
        }
        if (_board[_x][_y].number === number) {
          result = true;
        }
      }
    }

    return result;
  };

  const doDelete = () => {
    const newBoard = [...board];
    if (newBoard[currX][currY].isActive) {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (newBoard[currX][currY].number === newBoard[i][j].number) {
            newBoard[i][j].isDanger = false;
          }
        }
      }
      newBoard[currX][currY].number = 0;
      newBoard[currX][currY].isDanger = false;
      const filter = dangerXYs.filter((item) => {
        return item !== `${currX}${currY}`;
      });
      setDangerXYs(filter);
      setBoard(newBoard);
    }
  };

  const isClear = (newBoard) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (
          !newBoard[i][j].number ||
          newBoard[i][j].isDanger ||
          newBoard[i][j].isEdit
        ) {
          return false;
        }
      }
    }
    return true;
  };

  const handleCancel = () => {
    setGameClearModalVisible(false);
  };

  const doNext = () => {
    setGameClearModalButtonVisible(false);
    setGameClearModalVisible(false);
    setLevel(Number(level) + 1);
  };

  const doNumber = (number) => {
    const newBoard = [...board];
    if (isEditMode) {
      if (!newBoard[currX][currY].isDefault) {
        newBoard[currX][currY].isEdit = true;
        newBoard[currX][currY].editColumnNuber[number - 1] = number;
        setBoard(newBoard);
      }
    } else {
      newBoard[currX][currY].isEdit = false;
      if (
        newBoard[currX][currY].isActive &&
        newBoard[currX][currY].number !== number
      ) {
        for (let i = 0; i < 9; i++) {
          for (let j = 0; j < 9; j++) {
            if (!dangerXYs.includes(`${i}${j}`)) {
              newBoard[i][j].isDanger = false;
            }
          }
        }

        const isDanger = doDangerCheck(currX, currY, number);

        // 오답
        if (isDanger) {
          newBoard[currX][currY].isDanger = true;
          for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
              if (newBoard[i][j].number === number) {
                newBoard[i][j].isDanger = true;
              }
            }
          }
          const strDangerXY = `${currX}${currY}`;
          if (!dangerXYs.includes(strDangerXY)) {
            setDangerXYs([...dangerXYs, strDangerXY]);
          }
        } else {
          // 정답
          // 해당값은 맞는 값이고 나머지 값들도 확인필요
          newBoard[currX][currY].isDanger = false;
          newBoard[currX][currY].number = number;

          const filter = dangerXYs.filter((item) => {
            const [restX, restY] = item.split("");
            if (`${restX}${restY}` !== `${currX}${currY}`) {
              const restNumber = newBoard[restX][restY].number;
              const isRestDanger = doDangerCheck(
                restX,
                restY,
                restNumber,
                newBoard
              );
              if (!isRestDanger) {
                newBoard[restX][restY].isDanger = false;
              }
              return isRestDanger;
            }
            return false;
          });
          setDangerXYs(filter);
        }

        newBoard[currX][currY].number = number;
        setBoard(newBoard);

        setTimeout(() => {
          if (isClear(newBoard)) {
            localStorage.setItem(`sudoku-${type}`, Number(level) + 1);
            setGameClearModalVisible(true);
            setTimeout(() => {
              setGameClearModalButtonVisible(true);
            }, 2000);
          }
        }, 100);
      }
    }
  };

  const setIsActive = (x, y) => {
    const newBoard = [...board];
    if (!newBoard[x][y].isDefault && currX !== -1 && currY !== -1) {
      newBoard[currX][currY].isActive = false;
    }
    if (!newBoard[x][y].isDefault || !newBoard[x][y].number) {
      newBoard[x][y].isActive = !newBoard[x][y].isActive;
      setCurrX(x);
      setCurrY(y);
    }
    setBoard(newBoard);
  };

  const columnChangeColor = (x, y, number) => {
    const newBoard = [...board];
    const { xHeightIndex, yHeightIndex, xWidthIndex, yWidthIndex } = getWHIndex(
      x,
      y
    );

    // 세로 색상처리
    for (const _x of xHeightIndex) {
      for (const _y of yHeightIndex) {
        newBoard[_x][_y].isHover = true;
      }
    }

    // 가로 색상처리
    for (const _x of xWidthIndex) {
      for (const _y of yWidthIndex) {
        newBoard[_x][_y].isHover = true;
      }
    }

    // 해당 사각형 전부 색상 처리
    for (let i = 0; i < 9; i++) {
      newBoard[x][i].isHover = true;
    }

    // 같은 숫자 색상처리
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newBoard[i][j].number && newBoard[i][j].number === number) {
          newBoard[i][j].isNumberHover = true;
        }
      }
    }

    setBoard(newBoard);
  };

  const columnResetColor = () => {
    const newBoard = [...board];
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        newBoard[i][j].isHover = false;
        newBoard[i][j].isNumberHover = false;
      }
    }

    setBoard(newBoard);
  };

  const _setKeyNumber = useCallback((e) => {
    if (isNumber(e.key)) {
      doNumber(Number(e.key));
    }
  }, []);

  useEffect(() => {
    if (level === 1) {
      localStorage.setItem(`sudoku-${type}`, level);
    }

    let mapBoard = [];
    if (type === "easy") {
      mapBoard = easy[level];
    } else if (type === "normal") {
      mapBoard = normal[level];
    } else if (type === "hard") {
      mapBoard = hard[level];
    } else if (type === "crazy") {
      mapBoard = crazy[level];
    }
    const map = mapBoard.map((room, x) => {
      return room.map((number, y) => {
        return {
          isDefault: number ? true : false,
          isActive: false,
          isHover: false,
          isNumberHover: false,
          isDanger: false,
          number: number,
          isEdit: false,
          editColumnNuber: [0, 0, 0, 0, 0, 0, 0, 0, 0],
        };
      });
    });
    setBoard(map);

    if (window.innerWidth < 605) {
      setBoardHeight(window.innerWidth);
    }

    document.addEventListener("keydown", _setKeyNumber);
    return () => {
      document.addEventListener("keydown", _setKeyNumber);
    };
  }, [level]);

  return (
    <div className="game-container">
      <div className="sudoku-level text-center text-3xl mb-8">
        LEVEL {level}
      </div>
      <div className="game-board">
        <Row gutter={[2, 2]}>
          {board.length > 0 &&
            board.map((room, x) => (
              <Col key={x} className="game-tile" span={8}>
                <Row>
                  {room.map((item, y) => (
                    <React.Fragment key={`${x}-${y}`}>
                      {item.isEdit ? (
                        <Col
                          span={8}
                          className={`game-inner-tile 
                            ${item.isHover ? "game-inner-tile-hover" : ""}
                            ${item.isActive ? "game-inner-tile-active" : ""}`}
                          onClick={() => setIsActive(x, y)}
                        >
                          <Row>
                            {item.editColumnNuber.map((_item, _y) => (
                              <Col key={`${_item}-${_y}`} span={8}>
                                <span
                                  className={`${
                                    !_item ? "opacity-0" : "opacity-1"
                                  }`}
                                >
                                  {_item ? _item : 0}
                                </span>
                              </Col>
                            ))}
                          </Row>
                        </Col>
                      ) : (
                        <Col
                          onClick={() => setIsActive(x, y)}
                          className={`game-inner-tile
                      ${!item.isActive ? "game-inner-tile" : ""}
                      ${item.isHover ? "game-inner-tile-hover" : ""}
                      ${
                        item.isNumberHover ? "game-inner-tile-number-hover" : ""
                      }
                      ${!item.isDefault ? "game-inner-tile-default" : ""}
                      ${item.isActive ? "game-inner-tile-active" : ""}
                      ${item.isDanger ? "game-inner-tile-danger" : ""}`}
                          span={8}
                          onPointerEnter={() =>
                            columnChangeColor(x, y, item.number)
                          }
                          onPointerLeave={() => columnResetColor()}
                        >
                          {item.number ? (
                            <div className="text-2xl pt-4">{item.number}</div>
                          ) : (
                            ""
                          )}
                        </Col>
                      )}
                    </React.Fragment>
                  ))}
                </Row>
              </Col>
            ))}
        </Row>
      </div>
      <div className="game-pad">
        <div className="game-editor-button mb-12">
          {/* <Button size="large" type="text">
            <FontAwesomeIcon icon={faUndo} />
            되돌리기
          </Button> */}
          <Button size="large" type="text" onClick={() => doDelete()}>
            <FontAwesomeIcon icon={faEraser} />
            지우기
          </Button>
          <Button
            size="large"
            type="text"
            onClick={() => setIsEditMode(!isEditMode)}
          >
            <FontAwesomeIcon icon={faEdit} />
            메모
            <span
              className={`font-bold ml-1 ${isEditMode ? "text-blue-300" : ""}`}
            >
              {isEditMode ? "ON" : "OFF"}
            </span>
          </Button>
        </div>
        <div className="game-pad-button-group">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
            <button
              key={item}
              className="game-pad-button"
              onClick={() => doNumber(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <Modal
        title="SUDOKU CLEAR"
        open={gameClearModalVisible}
        onOk={doNext}
        onCancel={handleCancel}
        width={480}
        closable={false}
        maskClosable={false}
        footer={
          gameClearModalButtonVisible
            ? [
                <Button key="submit" type="secondary" onClick={doNext}>
                  Next
                </Button>,
              ]
            : ""
        }
      ></Modal>
    </div>
  );
};
