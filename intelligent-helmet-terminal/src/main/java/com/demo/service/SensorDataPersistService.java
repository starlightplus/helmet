package com.demo.service;

import com.demo.model.SensorData;
import com.demo.repository.SensorDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class SensorDataPersistService {

    @Autowired
    private SensorDataRepository sensorDataRepository;

    @Async
    public void persist(SensorData sensorData) {
        try {
            sensorDataRepository.save(sensorData);
        } catch (Exception e) {
            System.err.println("[DB] 传感器数据写入失败: " + e.getMessage());
        }
    }
}
