import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const useAgent = (userId: string) => {
  const [logs, setLogs] = useState([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:3000/api/v1/agent/log';
  const HISTORY_URL = `http://localhost:3000/api/v1/agent/history/${userId}`;
  const ROADMAP_URL = `http://localhost:3000/api/v1/agent/roadmap/${userId}/75`; 

  const fetchAllData = useCallback(async () => {
    try {
      const [historyRes, roadmapRes] = await Promise.all([
        axios.get(HISTORY_URL),
        axios.get(ROADMAP_URL)
      ]);
      
      setLogs(historyRes.data.history || []);
      setAnalysis(historyRes.data.analysis || null);
      setRoadmap(roadmapRes.data.projection || null);
    } catch (err) {
      console.error("Error sincronizando con el cerebro de FITCO AI");
    }
  }, [HISTORY_URL, ROADMAP_URL]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const sendLog = async (data: any) => {
    setLoading(true);
    try {
      const payload = {
        userId,
        weight: Number(data.weight),
        calories: Number(data.calories),
        fat: Number(data.fat),
        sleepHours: Number(data.sleepHours),
        activityLevel: data.activityLevel || "HIGH"
      };

      const response = await axios.post(API_URL, payload);
      await fetchAllData(); 
      return response.data;
    } catch (error: any) {
      
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { logs, analysis, roadmap, sendLog, loading, fetchLogs: fetchAllData };
};