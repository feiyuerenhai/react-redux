//通过 tnpm run trans 编译脚本

import React from 'react';
import ReactDOM from 'react-dom';
import {connect, Provider} from 'react-redux';
import {createStore} from 'redux';

//回顾下redux理念：
//一个新的action通过dispatch方法传导给store
//在内部，store将这个action逐个交给自己麾下的reducer消化
//消化完毕，action对于数据作了改动，store向外广播说自己状态发生了变化
//所以，简而言之，action进入store，逐一经过reducer，消化完毕则store更新
//变化的有两个部分：一，新的action，二，新的store
//变化的部分可以进一步简化为：一，产生什么变化，二，变化体现在哪里
//其他的全都是固定不变的或者可以抽象提取的

var actionCreator = function(data){
	var action = {
		type: 'INPUT_NAME',
		data: data
	};
	return action;
};

var reducer = function(state={message: 'unknown'}, action){
	switch(action.type){
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

var store = createStore(reducer);

store.subscribe(function(){
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

var Comp = React.createClass({
	render: function() {
		return <div>
					<h1 onClick={this.props.doSth}>Hi, My name is {this.props.name}</h1>
					<h5>tip: click to see the name</h5>
				</div>
	}
});

var mapStateToProps = function(state, ownProps){
	return {
		name: state.message + ownProps.ss
	}
};

var mapDispatchToProps = function(dispatch, ownProps){
	return {
		doSth: function(){
			dispatch( actionCreator('bob') );
		}
	}
};

//这就是包装组件
var CompX = connect(mapStateToProps, mapDispatchToProps)(Comp);

//Provider内部其实就是将this.props.store提取出来作为整个应用的state
var App = React.createClass({
	render: function(){
		return (
			<Provider store={store}>
				<CompX ss="!"/>
			</Provider>
		);
	}
});

ReactDOM.render(<App/>, document.getElementById('app'));