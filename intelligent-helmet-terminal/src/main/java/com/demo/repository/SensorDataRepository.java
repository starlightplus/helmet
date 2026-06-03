package com.demo.repository;

import com.demo.model.SensorData;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SensorDataRepository extends JpaRepository<SensorData, Long> {

    Optional<SensorData> findTopByDeviceIdOrderByReceiveTimeDesc(String deviceId);

    List<SensorData> findByDeviceIdOrderByReceiveTimeDesc(String deviceId);

    // 分页查最近N条
    List<SensorData> findByDeviceIdOrderByReceiveTimeDesc(String deviceId, Pageable pageable);

    // 全表按时间倒序取最新一条有 GPS 的记录（不限设备）
    @Query("SELECT s FROM SensorData s WHERE s.latitude IS NOT NULL AND s.longitude IS NOT NULL ORDER BY s.receiveTime DESC")
    List<SensorData> findLatestWithGps(Pageable pageable);

    // 全表按时间倒序取最新一条（不限设备，用于初始化终端数据）
    @Query("SELECT s FROM SensorData s ORDER BY s.receiveTime DESC")
    List<SensorData> findLatestOne(Pageable pageable);

    // 各字段最新非 null 值（用于终端初始化快照）
    @Query("SELECT s.temperature FROM SensorData s WHERE s.temperature IS NOT NULL ORDER BY s.receiveTime DESC")
    List<Double> findLatestTemperature(Pageable pageable);

    @Query("SELECT s.humidity FROM SensorData s WHERE s.humidity IS NOT NULL ORDER BY s.receiveTime DESC")
    List<Double> findLatestHumidity(Pageable pageable);

    @Query("SELECT s.battery FROM SensorData s WHERE s.battery IS NOT NULL ORDER BY s.receiveTime DESC")
    List<Integer> findLatestBattery(Pageable pageable);

    @Query("SELECT s.voltage FROM SensorData s WHERE s.voltage IS NOT NULL ORDER BY s.receiveTime DESC")
    List<Double> findLatestVoltage(Pageable pageable);

    @Query("SELECT s.heartRate FROM SensorData s WHERE s.heartRate IS NOT NULL ORDER BY s.receiveTime DESC")
    List<Integer> findLatestHeartRate(Pageable pageable);

    @Query("SELECT s.spo2 FROM SensorData s WHERE s.spo2 IS NOT NULL ORDER BY s.receiveTime DESC")
    List<Integer> findLatestSpo2(Pageable pageable);

    // 按时间范围查，正序（用于天级别图表）
    List<SensorData> findByDeviceIdAndReceiveTimeBetweenOrderByReceiveTimeAsc(
            String deviceId, LocalDateTime start, LocalDateTime end);

    // 小时级别：按小时聚合，取每小时平均温湿度
    @Query("SELECT FUNCTION('DATE_FORMAT', s.receiveTime, '%Y-%m-%d %H:00') as hour, AVG(s.temperature), AVG(s.humidity) " +
           "FROM SensorData s WHERE s.deviceId = :deviceId " +
           "AND s.receiveTime BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('DATE_FORMAT', s.receiveTime, '%Y-%m-%d %H:00') " +
           "ORDER BY FUNCTION('DATE_FORMAT', s.receiveTime, '%Y-%m-%d %H:00') ASC")
    List<Object[]> findHourlyAvgByDeviceId(
            @Param("deviceId") String deviceId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 天级别：按天聚合，取每天的平均温湿度
    @Query("SELECT FUNCTION('DATE', s.receiveTime) as day, AVG(s.temperature), AVG(s.humidity) " +
           "FROM SensorData s WHERE s.deviceId = :deviceId " +
           "AND s.receiveTime BETWEEN :start AND :end " +
           "GROUP BY FUNCTION('DATE', s.receiveTime) ORDER BY FUNCTION('DATE', s.receiveTime) ASC")
    List<Object[]> findDailyAvgByDeviceId(
            @Param("deviceId") String deviceId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // 心率历史：按时间倒序取最近N条有心率的记录
    @Query("SELECT s FROM SensorData s WHERE s.deviceId = :deviceId AND s.heartRate IS NOT NULL ORDER BY s.receiveTime DESC")
    List<SensorData> findHeartRateHistory(@Param("deviceId") String deviceId, Pageable pageable);

    // 血氧历史：按时间倒序取最近N条有血氧的记录
    @Query("SELECT s FROM SensorData s WHERE s.deviceId = :deviceId AND s.spo2 IS NOT NULL ORDER BY s.receiveTime DESC")
    List<SensorData> findSpo2History(@Param("deviceId") String deviceId, Pageable pageable);

    // 电量历史：按时间倒序取最近N条有电量的记录
    @Query("SELECT s FROM SensorData s WHERE s.deviceId = :deviceId AND s.battery IS NOT NULL ORDER BY s.receiveTime DESC")
    List<SensorData> findBatteryHistory(@Param("deviceId") String deviceId, Pageable pageable);
}
