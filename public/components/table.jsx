import React from 'react';

class TableRow extends React.Component {
  constructor(props) {
    super(props);
    this.state = { rownum: this.props.rownum, data: this.props.data };
  }

  render() {
    const tdClass = this.props.tdClassName;
    const className = this.props.className;
    const id = this.props.id;
    const click = this.props.click;

    return (
      <tr className={className} id={id}>
        <td
          className={tdClass}
          onClick={click}
          data-columns={JSON.stringify(this.state.data)}
        >
          {this.state.data.rowid}
        </td>
        <td
          className={tdClass}
          onClick={click}
          data-columns={JSON.stringify(this.state.data)}
        >
          {this.state.data.username}
        </td>
        <td
          className={tdClass}
          onClick={click}
          data-columns={JSON.stringify(this.state.data)}
        >
          {this.state.data.email}
        </td>
      </tr>
    );
  }
}

/* {this.state.data.map((col, key) => {
  return (
    <td
      className={tdClass}
      key={key}
      onClick={click}
      data-columns={this.state.data}
    >
      {col}
    </td>
  );
})} */

class Table extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const columns = this.props.columns;
    const className = this.props.className;
    const tHeadClass = this.props.tHeadClass;
    const tHeadRowClass = this.props.tHeadRowClass;
    const tBodyClass = this.props.tBodyClass;

    return (
      <table className={className}>
        <thead className={tHeadClass}>
          <tr className={tHeadRowClass}>
            {columns.map((col, key) => {
              return <td key={key}>{col}</td>;
            })}
          </tr>
        </thead>
        <tbody className={tBodyClass}>
          {React.Children.map(this.props.children, (child, key) => {
            if (key % 2 == 0) {
              return React.cloneElement(child, { id: 'users-row-even' });
            } else {
              return React.cloneElement(child, { id: 'users-row-odd' });
            }
          })}
        </tbody>
      </table>
    );
  }
}

export { Table, TableRow };
