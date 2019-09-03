import React from 'react';
import ReactDOM from 'react-dom';
import "./index.css";

function Square(props) {
  return (
    <button className="square" onClick={props.onClick} style={props.highlighted ? { backgroundColor: "#decf4b" } : { backgroundColor: "#ffffff" }}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {
  renderSquare(i) {
    return (
      <Square
        value={this.props.squares[i]}
        onClick={() => this.props.onClick(i)}
        highlighted={this.props.highlights && this.props.highlights.indexOf(i) !== -1}
      />
    );
  }

  createBoard() {
    let board = [];
    for (let i = 0; i < 3; i++) {
      let row = [];
      for (let j = 0; j < 3; j++) {
        row.push(this.renderSquare(i * 3 + j));
      }
      board.push(<div className="board-row">{row}</div>);
    }
    return board;
  }

  render() {
    return (
      <div>
        {this.createBoard()}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [
        {
          squares: Array(9).fill(null),
          change: null,
        }
      ],
      stepNumber: 0,
      xIsNext: true,
      reversedHistory: false,
      playingVersusAI: true,
    };
  }

  renderHistory() {
    const history = this.state.history;
    let moves;

    if (this.state.playingVersusAI) {
      moves = history.map((step, move) => {
        if (move % 2 === 0) {
          const desc = move % 2 === 0 && move !== 0 ?
            `Go to move #${move} (${parseInt(history[move].change / 3 + 1)}, ${history[move].change % 3 + 1})` :
            'Go to game start';
          return (
            <li key={move}>
              <button
                style={move === this.state.stepNumber ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}
                onClick={() => this.jumpTo(move)}>{desc}</button>
            </li>
          );
        }
      });
    }

    else {
      moves = history.map((step, move) => {
        const desc = move ?
          `Go to move #${move} (${parseInt(history[move].change / 3 + 1)}, ${history[move].change % 3 + 1})` :
          'Go to game start';
        return (
          <li key={move}>
            <button
              style={move === this.state.stepNumber ? { fontWeight: 'bold' } : { fontWeight: 'normal' }}
              onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
      });
    }

    return moves;
  }

  async handleClick(i, isPlayer = true) {
    let history = this.state.history.slice(0, this.state.stepNumber + 1);
    let current = history[history.length - 1];
    let squares = current.squares.slice();
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    squares[i] = this.state.xIsNext ? "X" : "O";
    await this.setState({ // setState is asynchronous so we must wait to make a decision by the computer
      history: history.concat([
        {
          squares: squares,
          change: i,
        }
      ]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext
    });

    if (isPlayer && !isBoardFull(squares) && this.state.playingVersusAI) {
      this.handleClick(calculateNextMove(squares), false);
    }
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0
    });
  }

  reverseHistory() {
    this.setState({
      reversedHistory: !this.state.reversedHistory,
    });
  }

  toggleGameMode() {
    this.setState({
      playingVersusAI: !this.state.playingVersusAI,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = calculateWinner(current.squares);

    let moves = this.renderHistory();

    if (this.state.reversedHistory) {
      moves = moves.reverse();
    }

    let status;
    if (winner) {
      status = "Winner: " + winner.symbol;
    } else if (isBoardFull(current.squares)) {
      status = "Draw!";
    } else {
      status = "Next player: " + (this.state.xIsNext ? "X" : "O");
    }

    return (
      <div className="game">
        <h1>Tic-Tac-Toe</h1>
        <div className="game-board">
          <Board
            squares={current.squares}
            highlights={winner ? winner.squares : null}
            onClick={i => this.handleClick(i)}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
          <div className="toggle-button">
            <button onClick={() => this.reverseHistory()}>
              Toggle Order
            </button>
          </div>
          <div>
            <button onClick={() => this.toggleGameMode()}>
              Current Mode: {this.state.playingVersusAI ? "Versus Computer" : "2 Player"}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        symbol: squares[a],
        squares: [a, b, c]
      };
    }
  }
  return null;
}

function isBoardFull(squares) {
  for (let square of squares) {
    if (square === null) {
      return false;
    }
  }
  return true;
}

function calculateNextMove(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) { // Check for winning conditions
    const [a, b, c] = lines[i];
    if (!squares[a] && squares[b] === squares[c] && squares[b] === "O") {
      return a;
    } else if (!squares[b] && squares[a] === squares[c] && squares[a] === "O") {
      return b;
    } else if (!squares[c] && squares[a] === squares[b] && squares[a] === "O") {
      return c;
    }
  }

  for (let i = 0; i < lines.length; i++) { // Check for winning conditions
    const [a, b, c] = lines[i];
    if (!squares[a] && squares[b] === squares[c] && squares[b] === "X") {
      return a;
    } else if (!squares[b] && squares[a] === squares[c] && squares[a] === "X") {
      return b;
    } else if (!squares[c] && squares[a] === squares[b] && squares[a] === "X") {
      return c;
    }
  }

  for (let i = 0; i < squares.length; i++) {
    if (!squares[i]) {
      return i;
    }
  }
}