import {createContext, useContext, useReducer} from 'react';
import {Action, Task, Tasks} from '../types/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppState = {
  tasks: Task[];
  addTask: (task: Task) => void;
  addTasks: (tasks: Tasks) => void;
  removeTask: (task: Task) => void;
};

const initialState: AppState = {
  tasks: [],
  addTask: () => {},
  addTasks: () => {},
  removeTask: () => {},
};

const AppReducer = (state: AppState, action: Action): AppState => {
  let newTasks = [];
  switch (action.type) {
    case 'ADD_TASK':
      newTasks = [...state.tasks, action.payload];
      try {
        AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
        return {
          ...state,
          tasks: newTasks,
        };
      } catch (error) {
        throw new Error('No saved storage');
      }
    case 'ADD_TASKS':
      try {
        return {
          ...state,
          tasks: action.payload,
        };
      } catch (error) {
        throw new Error('No load storage');
      }
    case 'REMOVE_TASK':
      try {
        newTasks = state.tasks.filter(task => task.id !== action.payload.id);
        AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
        return {
          ...state,
          tasks: newTasks,
        };
      } catch (error) {
        throw new Error('No load storage');
      }
    default:
      console.log('Action no defined');
      break;
  }
  return state;
};

const AppContext = createContext<AppState>(initialState);

export const AppProvider = ({children}: {children: React.ReactNode}) => {
  const [{tasks}, dispatch] = useReducer(AppReducer, initialState);

  const addTask = (task: Task) => {
    dispatch({type: 'ADD_TASK', payload: task});
  };

  const addTasks = (loadTasks: Tasks) => {
    dispatch({type: 'ADD_TASKS', payload: loadTasks});
  };

  const removeTask = (task: Task) => {
    dispatch({type: 'REMOVE_TASK', payload: task});
  };

  const value = {tasks, addTask, addTasks, removeTask};

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp debe ser utilizado dentro de AppProvider');
  }
  return context;
};
