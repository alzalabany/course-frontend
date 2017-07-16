/* React container App	*/
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
// import { withRouter } from 'react-router-dom';

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {}

    this.handleAction = this.handleAction.bind(this)
  }
  componentWillMount(){}

  handleAction(){
    
  }

  componentWillReceiveProps(props){}
  shouldComponentUpdate(props, state){return Boolean(props!==this.props || state!==this.state)}
  componentWillUpdate(props, state){}

  render() {
    return (
      <div style={styles.container}>
      <h5>App</h5>
      <pre style={styles.flex}>{JSON.stringify(this.props.data)}</pre>
      </div>
    );
  }
  componentDidmount(){}
  componentDidUpdate(){}
  componentWillUnmount(){}
}

const styles = {
  container:{
    flex: 1,
    display: 'flex',
    flexDirection: 'row'
  },
  flex:{
    flex:1
  }
}


const mapStoreStateToProps = state => ({
  //data: state.getIn(['App']')
})
const propsForActions = dispatch => ({
  dispatch,
})

App.propTypes = {
  dispatch: PropTypes.func.isRequired,
};
App.displayName = 'App';
App.defaultProps = ({
  dispatch:console.warn
})

export default connect(mapStoreStateToProps, propsForActions)(App);