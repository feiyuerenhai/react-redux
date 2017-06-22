define(['react', 'react-dom', 'react-redux', 'redux'], function (_react, _reactDom, _reactRedux, _redux) {
	'use strict';

	var _react2 = _interopRequireDefault(_react);

	var _reactDom2 = _interopRequireDefault(_reactDom);

	function _interopRequireDefault(obj) {
		return obj && obj.__esModule ? obj : {
			default: obj
		};
	}

	//回顾下redux理念：
	//一个新的action通过dispatch方法传导给store
	//在内部，store将这个action逐个交给自己麾下的reducer消化
	//消化完毕，action对于数据作了改动，store向外广播说自己状态发生了变化
	//所以，简而言之，action进入store，逐一经过reducer，消化完毕则store更新
	//变化的有两个部分：一，新的action，二，新的store
	//变化的部分可以进一步简化为：一，产生什么变化，二，变化体现在哪里
	//其他的全都是固定不变的或者可以抽象提取的

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
		console.log('store更新了', store.getState());
	});

	//与react共用的时候，我们需要让react组件，一，发送action，二，从store取数据
	//任何一个react-redux组件都需要调用store.dispatch发送action，也都要从store中取数据
	//为了统一处理，我们对每一个react组件外层都重新包装，而且约定每一个react组件都纯粹地只负责UI
	//逻辑业务都交给外层的包装组件，该包装组件会：
	//将UI组件传递来的action向上交给store，订阅store更新，一旦store更新重新取值传递给UI组件
	//除此之外，包装组件自己也会接受用户props数据，
	//所以，包装组件总共需要向下提供：1，store接口，2，dispatch接口，3，包装组件自己的props接口
	//而UI组件只负责渲染，它的所有数据都从props中来，利用props从上面接受传递来的数据
	//简而言之
	//纯UI组件只向上暴露props，接受从上而下的数据
	//包装组件只向下暴露store接口、dispatch接口、以及ownProps数据，自上而下传递数据给纯UI组件
	//至于store.dispatch( action )、store.subscribe( store.getState().path.value )都交给包装组件抽象处理了

	var Comp = _react2.default.createClass({
		displayName: 'Comp',
		showContext: function showContext() {
			//### context核心论述 ###
			//react组件的props属性中有一个特殊,this.props.children
			//该组件用于获取render方法中，该组件的子节点
			//这些子节点代表的也是多个子组件，但是，这些子组件在渲染的时候，其实会取调用当前组件的getChildContext方法
			//但前提是，一定要使用Comp.contextTypes声明，子组件能获得哪些当前组件的上下文
			//也就是说，当前组件可以，一，通过props将数据传递给子“组件内”，二，通过context，使得捆绑在一起“组件间”共享数据
			//Provider的本质就是利用了getChildContext，将store传递给子组件
			//这样以来，我们可以不必非要显式地将组件逐个赋给Provider下的Connected组件，
			//而是隐式地通过context传递
			//因此，connect advanced方法的本质也就变成：包装一个组件，定义其mapped contextTypes
			//也正因为此，子组件才能获取看似没有关联的Provider中的store数据
			console.log(this.context, this.context.store.getState());
		},

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
					{ onClick: this.showContext },
					'tip: click to see the name'
				)
			);
		}
	});

	Comp.contextTypes = {
		store: _react2.default.PropTypes.object
	};

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

	//这就是包装组件
	var CompX = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Comp);

	//Provider内部其实就是将this.props.store提取出来作为整个应用的state
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

	//以上只是简单勾勒出了react-redux的基础使用
	//在实际应用中，组件树往往十分复杂，该怎么解决呢？
	//第一种办法是，只在树顶作连接，然后将state、dispatch、props层层传递
	//第二种办法是，为每一个需要的组件都进行一次连接
	//优先的做法是第二种
	//其实，dumb组件之上的smart组件可以看作是store在该dumb组件处的代理人
	//代理人负责衔接两者的关系，不管组件树层级多深，任一个节点组件处的dumb组件都被直接代理到了store中
	//也可以说，connected smart component是store在dumb组件处的一个镜像
	//所以，不管这些智能组件层级多深，它们与store的关系都是扁平的、平行的
	//另外，对于任意一个需要有数据交互的组件改造为智能组件其实非常简单，也就是connect一次而已
	//所以，复杂应用的组件树是这样的：
	//深度为x的某个组件n可能是被改装后的智能组件，它直接与store相连，其他没有数据交互的组件都只是dumb组件
});
