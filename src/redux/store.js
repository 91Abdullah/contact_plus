import {applyMiddleware, createStore, combineReducers} from "redux";
import logger from 'redux-logger'
import thunk from "redux-thunk"
import {user} from "./user"
import {agent} from "./agent";
import {system} from "./system";
import {stats} from "./stats";
import {workcode} from "./workcode";

export const ConfigureStore = () => {
    return createStore(combineReducers({
        user,
        agent,
        system,
        stats,
        workcode
    }), applyMiddleware(thunk, logger))
}
