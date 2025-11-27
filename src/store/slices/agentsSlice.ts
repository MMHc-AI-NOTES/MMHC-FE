// store/slices/agentsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Agent } from '@/types/agent';

interface AgentsState {
  selectedAgentId: number | null;

  agents: Agent[];
  loading: boolean;
}

const initialState: AgentsState = {
  selectedAgentId: null,
  agents: [],
  loading: false,
};

const agentsSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    setAgents: (state, action: PayloadAction<Agent[]>) => {
      state.agents = action.payload;
    },
    addAgent: (state, action: PayloadAction<Agent>) => {
      state.agents.push(action.payload);
    },
    updateAgentInStore: (state, action: PayloadAction<Agent>) => {
      const index = state.agents.findIndex(agent => agent.id === action.payload.id);
      if (index !== -1) {
        state.agents[index] = action.payload;
      }
    },
    deleteAgentFromStore: (state, action: PayloadAction<number>) => {
      state.agents = state.agents.filter(agent => agent.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSelectedAgentId: (state, action: PayloadAction<number | null>) => {
      state.selectedAgentId = action.payload;
    },
  },
});

export const { setAgents, addAgent, updateAgentInStore, deleteAgentFromStore, setLoading, setSelectedAgentId } = agentsSlice.actions;
export default agentsSlice.reducer;
