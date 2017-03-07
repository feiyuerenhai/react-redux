define(['react', 'react-dom', 'react-redux', 'redux'], function (_react, _reactDom, _reactRedux, _redux) {
	'use strict';

	var _react2 = _interopRequireDefault(_react);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	// export {Greeting};

	//通过 tnpm run trans 编译脚本

	var actionCreator = function actionCreator(data) {
		var action = {
			type: 'INPUT_NAME',
			data: data
		};
		return action;
	};

	var reducer = function reducer() {
		var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { message: 'unknown' };
		var action = arguments[1];

		switch (action.type) {
			case 'INPUT_NAME':
				console.log('action type', action.type, 'received data', action.data);
				return Object.assign({}, state, {
					message: action.data
				});
				break;
			default:
				return state;
		}
	};

	var store = (0, _redux.createStore)(reducer);

	store.subscribe(function () {
		// store变动，更新视图
		console.log('SHOULD UPDATE VIEW', store.getState());
	});

	// store.dispatch( actionCreator('bob') );

	var Comp = _react2.default.createClass({
		displayName: 'Comp',

		render: function render() {
			return _react2.default.createElement(
				'div',
				null,
				_react2.default.createElement(
					'h1',
					{ onClick: this.props.doSth },
					'Hi, My name is ',
					this.props.name
				),
				_react2.default.createElement(
					'h5',
					null,
					'tip: click to see the name'
				)
			);
		}
	});

	var mapStateToProps = function mapStateToProps(state, ownProps) {
		return {
			name: state.message + ownProps.ss
		};
	};

	var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
		return {
			doSth: function doSth() {
				dispatch(actionCreator('bob'));
			}
		};
	};

	var CompX = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Comp);

	var App = _react2.default.createClass({
		displayName: 'App',

		render: function render() {
			return _react2.default.createElement(
				_reactRedux.Provider,
				{ store: store },
				_react2.default.createElement(CompX, { ss: '!' })
			);
		}
	});

	_reactDom2.default.render(_react2.default.createElement(App, null), document.getElementById('app'));
});
