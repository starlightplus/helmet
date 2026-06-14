package com.demo.service;

import com.demo.model.DeviceStatus;
import com.demo.repository.DeviceStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * 设备状态服务：每个 deviceId 唯一一条，新数据到来时 upsert。
 */
@Service
public class DeviceStatusService {

    @Autowired
    private DeviceStatusRepository deviceStatusRepository;

    /**
     * 按 deviceId 更新或新建状态记录。incoming 中为 null 的字段不覆盖已有值。
     */
    public synchronized DeviceStatus upsert(DeviceStatus incoming) {
        if (incoming == null || incoming.getDeviceId() == null) return null;
        DeviceStatus row = deviceStatusRepository.findByDeviceId(incoming.getDeviceId())
                .orElseGet(() -> new DeviceStatus(incoming.getDeviceId()));

        if (incoming.getUptime()        != null) row.setUptime(incoming.getUptime());
        if (incoming.getMpu6050Status() != null) row.setMpu6050Status(incoming.getMpu6050Status());
        if (incoming.getWifiStatus()    != null) row.setWifiStatus(incoming.getWifiStatus());
        if (incoming.getGpsStatus()     != null) row.setGpsStatus(incoming.getGpsStatus());
        if (incoming.getDhtStatus()     != null) row.setDhtStatus(incoming.getDhtStatus());
        if (incoming.getMaxStatus()     != null) row.setMaxStatus(incoming.getMaxStatus());
        row.setUpdateTime(LocalDateTime.now());

        try {
            return deviceStatusRepository.save(row);
        } catch (Exception e) {
            System.err.println("[DeviceStatus] 写入失败: " + e.getMessage());
            return null;
        }
    }

    public DeviceStatus getByDeviceId(String deviceId) {
        if (deviceId == null) return null;
        Optional<DeviceStatus> opt = deviceStatusRepository.findByDeviceId(deviceId);
        return opt.orElse(null);
    }
}
