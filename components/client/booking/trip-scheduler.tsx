// components/booking/TripScheduler.tsx
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  Calendar,
  Clock,
  Users,
  Briefcase,
  ChevronDown,
  Check,
} from "lucide-react-native";
import { TripDetails, TripTiming } from "@/types/booking";

interface TripSchedulerProps {
  timing: TripTiming;
  details: TripDetails;
  onTimingChange: (timing: TripTiming) => void;
  onDetailsChange: (details: TripDetails) => void;
}

const TripScheduler: React.FC<TripSchedulerProps> = ({
  timing,
  details,
  onTimingChange,
  onDetailsChange,
}) => {
  const theme = useTheme();

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [tempDate, setTempDate] = useState(timing.departureDate || new Date());
  const [tempTime, setTempTime] = useState(timing.departureTime || new Date());
  const [showPassengerSelector, setShowPassengerSelector] = useState(false);
  const [showLuggageSelector, setShowLuggageSelector] = useState(false);

  const formatDate = (date?: Date): string => {
    if (!date) return "Select date";
    return date.toLocaleDateString();
  };

  const formatTime = (time?: Date): string => {
    if (!time) return "Select time";
    return time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSchedulingToggle = (isScheduled: boolean) => {
    onTimingChange({
      ...timing,
      isScheduled,
      // If turning off scheduling, clear the date and time
      departureDate: isScheduled ? timing.departureDate : undefined,
      departureTime: isScheduled ? timing.departureTime : undefined,
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");

    if (selectedDate) {
      setTempDate(selectedDate);

      if (Platform.OS === "android") {
        onTimingChange({
          ...timing,
          departureDate: selectedDate,
        });
      }
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === "ios");

    if (selectedTime) {
      setTempTime(selectedTime);

      if (Platform.OS === "android") {
        onTimingChange({
          ...timing,
          departureTime: selectedTime,
        });
      }
    }
  };

  const handleConfirmDateTime = () => {
    onTimingChange({
      ...timing,
      departureDate: tempDate,
      departureTime: tempTime,
    });

    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handlePassengerChange = (passengers: number) => {
    onDetailsChange({
      ...details,
      passengers,
    });

    setShowPassengerSelector(false);
  };

  const handleLuggageChange = (luggage: number) => {
    onDetailsChange({
      ...details,
      luggage,
    });

    setShowLuggageSelector(false);
  };

  return (
    <View style={styles.container}>
      {/* Scheduling option */}
      <Card style={styles.card}>
        <Typography variant="lg" weight="semibold" style={styles.cardTitle}>
          When do you want to travel?
        </Typography>

        <View style={styles.schedulingOptions}>
          <TouchableOpacity
            style={[
              styles.schedulingOption,
              !timing.isScheduled && styles.schedulingOptionSelected,
              {
                borderColor: !timing.isScheduled
                  ? theme.getColor("primary.brand")
                  : theme.getColor("gray.300"),
              },
            ]}
            onPress={() => handleSchedulingToggle(false)}
          >
            <Typography
              variant="md"
              weight={!timing.isScheduled ? "semibold" : "normal"}
              color={!timing.isScheduled ? "primary.brand" : "text"}
            >
              Now
            </Typography>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.schedulingOption,
              timing.isScheduled && styles.schedulingOptionSelected,
              {
                borderColor: timing.isScheduled
                  ? theme.getColor("primary.brand")
                  : theme.getColor("gray.300"),
              },
            ]}
            onPress={() => handleSchedulingToggle(true)}
          >
            <Typography
              variant="md"
              weight={timing.isScheduled ? "semibold" : "normal"}
              color={timing.isScheduled ? "primary.brand" : "text"}
            >
              Schedule
            </Typography>
          </TouchableOpacity>
        </View>

        {timing.isScheduled && (
          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimePicker}
              onPress={() => setShowDatePicker(true)}
            >
              <Calendar size={20} color={theme.getColor("gray.500")} />
              <Typography variant="md" style={styles.dateTimeText}>
                {formatDate(timing.departureDate)}
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimePicker}
              onPress={() => setShowTimePicker(true)}
            >
              <Clock size={20} color={theme.getColor("gray.500")} />
              <Typography variant="md" style={styles.dateTimeText}>
                {formatTime(timing.departureTime)}
              </Typography>
            </TouchableOpacity>

            {/* Date Picker Modal (iOS) or Native (Android)
            {showDatePicker && (
              <>
                {Platform.OS === "ios" ? (
                  <Card style={styles.dateTimePickerContainer}>
                    <View style={styles.dateTimePickerHeader}>
                      <TouchableOpacity
                        onPress={() => setShowDatePicker(false)}
                      >
                        <Typography variant="md" color="error">
                          Cancel
                        </Typography>
                      </TouchableOpacity>
                      <Typography variant="md" weight="semibold">
                        Select Date
                      </Typography>
                      <TouchableOpacity onPress={handleConfirmDateTime}>
                        <Typography
                          variant="md"
                          color="primary.brand"
                          weight="semibold"
                        >
                          Done
                        </Typography>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempDate}
                      mode="date"
                      display="spinner"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  </Card>
                ) : (
                  <DateTimePicker
                    value={tempDate}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    minimumDate={new Date()}
                  />
                )}
              </>
            )}

            {/* Time Picker Modal (iOS) or Native (Android) */}
            {/* {showTimePicker && (
              <>
                {Platform.OS === "ios" ? (
                  <Card style={styles.dateTimePickerContainer}>
                    <View style={styles.dateTimePickerHeader}>
                      <TouchableOpacity
                        onPress={() => setShowTimePicker(false)}
                      >
                        <Typography variant="md" color="error">
                          Cancel
                        </Typography>
                      </TouchableOpacity>
                      <Typography variant="md" weight="semibold">
                        Select Time
                      </Typography>
                      <TouchableOpacity onPress={handleConfirmDateTime}>
                        <Typography
                          variant="md"
                          color="primary.brand"
                          weight="semibold"
                        >
                          Done
                        </Typography>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={tempTime}
                      mode="time"
                      display="spinner"
                      onChange={handleTimeChange}
                    />
                  </Card>
                ) : (
                  <DateTimePicker
                    value={tempTime}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </>
            )} 
             */}
          </View>
        )}
      </Card>

      {/* Trip details */}
      <Card style={styles.card}>
        <Typography variant="lg" weight="semibold" style={styles.cardTitle}>
          Trip details
        </Typography>

        <View style={styles.detailsContainer}>
          {/* Passengers */}
          <TouchableOpacity
            style={styles.detailItem}
            onPress={() => setShowPassengerSelector(!showPassengerSelector)}
          >
            <View style={styles.detailIconContainer}>
              <Users size={20} color={theme.getColor("gray.500")} />
            </View>
            <View style={styles.detailContent}>
              <Typography variant="md">Passengers</Typography>
              <Typography variant="md" weight="semibold">
                {details.passengers}
              </Typography>
            </View>
            <ChevronDown
              size={20}
              color={theme.getColor("gray.500")}
              style={[
                styles.detailChevron,
                showPassengerSelector && styles.detailChevronOpen,
              ]}
            />
          </TouchableOpacity>

          {/* Passenger selector */}
          {showPassengerSelector && (
            <View style={styles.selectorContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorContent}
              >
                {[1, 2, 3, 4, 5, 6, 7].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.selectorItem,
                      details.passengers === count &&
                        styles.selectorItemSelected,
                      {
                        borderColor:
                          details.passengers === count
                            ? theme.getColor("primary.brand")
                            : theme.getColor("gray.300"),
                        backgroundColor:
                          details.passengers === count
                            ? theme.getColor("primary.brand")
                            : "transparent",
                      },
                    ]}
                    onPress={() => handlePassengerChange(count)}
                  >
                    <Typography
                      variant="md"
                      weight="semibold"
                      color={
                        details.passengers === count
                          ? "primary.lightest"
                          : "text"
                      }
                    >
                      {count}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Luggage */}
          <TouchableOpacity
            style={styles.detailItem}
            onPress={() => setShowLuggageSelector(!showLuggageSelector)}
          >
            <View style={styles.detailIconContainer}>
              <Briefcase size={20} color={theme.getColor("gray.500")} />
            </View>
            <View style={styles.detailContent}>
              <Typography variant="md">Luggage</Typography>
              <Typography variant="md" weight="semibold">
                {details.luggage}
              </Typography>
            </View>
            <ChevronDown
              size={20}
              color={theme.getColor("gray.500")}
              style={[
                styles.detailChevron,
                showLuggageSelector && styles.detailChevronOpen,
              ]}
            />
          </TouchableOpacity>

          {/* Luggage selector */}
          {showLuggageSelector && (
            <View style={styles.selectorContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.selectorContent}
              >
                {[0, 1, 2, 3, 4, 5, 6].map((count) => (
                  <TouchableOpacity
                    key={count}
                    style={[
                      styles.selectorItem,
                      details.luggage === count && styles.selectorItemSelected,
                      {
                        borderColor:
                          details.luggage === count
                            ? theme.getColor("primary.brand")
                            : theme.getColor("gray.300"),
                        backgroundColor:
                          details.luggage === count
                            ? theme.getColor("primary.brand")
                            : "transparent",
                      },
                    ]}
                    onPress={() => handleLuggageChange(count)}
                  >
                    <Typography
                      variant="md"
                      weight="semibold"
                      color={
                        details.luggage === count ? "primary.lightest" : "text"
                      }
                    >
                      {count}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    marginBottom: 16,
  },
  schedulingOptions: {
    flexDirection: "row",
    gap: 12,
  },
  schedulingOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: "center",
  },
  schedulingOptionSelected: {
    borderWidth: 2,
  },
  dateTimeContainer: {
    marginTop: 16,
    gap: 12,
  },
  dateTimePicker: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    gap: 8,
  },
  dateTimeText: {
    flex: 1,
  },
  dateTimePickerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    zIndex: 100,
  },
  dateTimePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  detailsContainer: {
    gap: 12,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIconContainer: {
    width: 40,
    alignItems: "center",
  },
  detailContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailChevron: {
    marginLeft: 8,
    transform: [{ rotate: "0deg" }],
  },
  detailChevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  selectorContainer: {
    marginTop: 8,
    marginBottom: 8,
  },
  selectorContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  selectorItem: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 24,
  },
  selectorItemSelected: {
    borderWidth: 2,
  },
});

export default TripScheduler;
