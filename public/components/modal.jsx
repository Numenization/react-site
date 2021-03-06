import React from 'react';
import PropTypes from 'prop-types';

class Modal extends React.Component {
  render() {
    if (!this.props.show) {
      return null;
    }

    return (
      <div className='backdrop'>
        <div className='modal' style={this.props.style}>
          <button className='modal-close-button' onClick={this.props.onClose}>
            <img src={require('../images/X-icon.svg')} />
          </button>
          {this.props.children}
        </div>
      </div>
    );
  }
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  show: PropTypes.bool,
  children: PropTypes.node
};

export default Modal;
