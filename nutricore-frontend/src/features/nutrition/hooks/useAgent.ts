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
      console.error("Error sincronizando FITCO");
    }
  }, [HISTORY_URL, ROADMAP_URL]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const sendLog = async (data: any) => {
    setLoading(true);
    try {
      
      const payload = {
        userId: String(userId),
        weight: parseFloat(data.weight) || 0,
        calories: parseInt(data.calories) || 0,
        fat: parseInt(data.fat) || 0,
        sleepHours: parseInt(data.sleepHours) || 0,
        activityLevel: String(data.activityLevel || "LOW")
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