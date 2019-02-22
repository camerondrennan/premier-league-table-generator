import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor(props) {
    super();
    this.state = {
      table: {}
    };
  }

  createTeam(teamName) {
    return {
      rank: 1,
      name: teamName,
      wins: 0,
      draws: 0,
      defeats: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0
    };
  }

  processMatch(table, match) {
    let homeTeamName = match.team1.name,
        awayTeamName = match.team2.name,
        homeTeamCode = match.team1.code,
        awayTeamCode = match.team2.code;

    if(!table[homeTeamCode]) {
      table[homeTeamCode] = this.createTeam(homeTeamName);
    }

    if(!table[awayTeamCode]) {
      table[awayTeamCode] = this.createTeam(awayTeamName);
    }

    table[homeTeamCode].goalsFor += match.score1;
    table[awayTeamCode].goalsFor += match.score2;

    table[homeTeamCode].goalsAgainst += match.score2;
    table[awayTeamCode].goalsAgainst += match.score1;

    table[homeTeamCode].goalDifference = table[homeTeamCode].goalsFor - table[homeTeamCode].goalsAgainst;
    table[awayTeamCode].goalDifference = table[awayTeamCode].goalsFor - table[awayTeamCode].goalsAgainst;

    if(match.score1 === match.score2) {
      table[homeTeamCode].draws += 1;
      table[awayTeamCode].draws += 1;

      table[homeTeamCode].points += 1;
      table[awayTeamCode].points += 1;
    }
    else if(match.score1 > match.score2) {
      table[homeTeamCode].wins += 1;
      table[awayTeamCode].defeats += 1;
      table[homeTeamCode].points += 3;
    }
    else {
      table[awayTeamCode].wins += 1;
      table[homeTeamCode].defeats += 1;
      table[awayTeamCode].points += 3;
    }
  }

  sortTable(table) {
    for(const team of Object.keys(table)) {
      for(const teamToCompare of Object.keys(table)) {
        if(team !== teamToCompare) {
          if(table[teamToCompare].points > table[team].points) {
            table[team].rank++;
          }
          else if(table[teamToCompare].points === table[team].points) {
            if(table[teamToCompare].goalDifference > table[team].goalDifference) {
              table[team].rank++;
            }
            else if(table[teamToCompare].goalDifference === table[team].goalDifference) {
              if(table[teamToCompare].goalsFor > table[team].goalsFor) {
                table[team].rank++;
              }
            }
          }
        }
      }
    }
    return JSON.stringify(table, null, 2);
  }

  generateLeagueTable() {
    fetch(`https://raw.githubusercontent.com/openfootball/football.json/master/2016-17/en.1.json`)
        .then(res => res.json())
        .then(data => {
          this.setState({
            rounds: data.rounds
          });

          data.rounds.map((matchday) => {
            matchday.matches.map((match) => {
              this.processMatch(this.state.table, match);
            })
          });

          this.setState({
            sortedTable: this.sortTable(this.state.table)
          });
        });
  }

  render() {
    return (
        <div className="App">
          <button style={this.state.sortedTable ? {display: 'none'} : {}} onClick={this.generateLeagueTable.bind(this)}>
            Generate League Table
          </button>
          <div>
            <pre>{this.state.sortedTable}</pre>
          </div>
        </div>
    );
  }
}

export default App;
