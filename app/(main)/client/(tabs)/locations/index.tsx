import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Alert,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Keyboard,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "@/hooks/useTheme";
import { Typography } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MapPin,
  Home,
  Briefcase,
  Heart,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  ChevronRight,
} from "lucide-react-native";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { debounce } from "lodash";
import { placesService } from "@/services/google/places";

// Define location type
type LocationType = "home" | "work" | "favorite";

// Define savedLocation type based on our Convex schema
type SavedLocation = {
  _id: Id<"savedLocations">;
  _creationTime: number;
  userId: Id<"users">;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: LocationType;
  isFavorite?: boolean;
  createdAt: number;
  updatedAt: number;
};

// Define place search result type
type PlaceSearchResult = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

const locationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  type: z.enum(["home", "work", "favorite"]),
  latitude: z.number().default(0),
  longitude: z.number().default(0),
});

type LocationFormData = z.infer<typeof locationFormSchema>;

export default function LocationsScreen() {
  const theme = useTheme();
  const currentUser = useQuery(api.auth.getMe);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLocation, setEditingLocation] = useState<SavedLocation | null>(
    null
  );
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMigrating, setIsMigrating] = useState(false);

  // Place search state
  const [placeSearchQuery, setPlaceSearchQuery] = useState("");
  const [placeSearchResults, setPlaceSearchResults] = useState<
    PlaceSearchResult[]
  >([]);
  const [isSearchingPlaces, setIsSearchingPlaces] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceSearchResult | null>(
    null
  );

  // Refs
  const searchInputRef = useRef<any>(null);

  // Fetch saved locations from Convex
  const savedLocations = useQuery(
    api.savedLocations.getAllLocations,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );

  // Mutations for creating, updating, and deleting locations
  const createOrUpdateLocation = useMutation(
    api.savedLocations.createOrUpdateLocation
  );
  const deleteLocation = useMutation(api.savedLocations.deleteLocation);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: {
      name: "",
      address: "",
      type: "favorite",
      latitude: 0,
      longitude: 0,
    },
  });

  // Watch the address field to update selected place
  const addressValue = watch("address");

  // Debounced place search
  const debouncedPlaceSearch = useRef(
    debounce(async (query: string) => {
      if (query.length >= 3) {
        setIsSearchingPlaces(true);
        try {
          const results = await placesService.autocomplete(query);
          console.log("🚀 ~ debouncedPlaceSearch ~ results:", results);
          setPlaceSearchResults(
            results.map((result) => ({
              id: result.place_id ?? `temp-${Math.random().toString(36)}`,
              name: result.description,
              address: result.description,
              latitude: 0,
              longitude: 0,
            }))
          );
        } catch (error) {
          console.error("Error searching places:", error);
        } finally {
          setIsSearchingPlaces(false);
        }
      } else {
        setPlaceSearchResults([]);
      }
    }, 500)
  ).current;

  // Handle place search input change
  useEffect(() => {
    if (placeSearchQuery) {
      debouncedPlaceSearch(placeSearchQuery);
    } else {
      setPlaceSearchResults([]);
    }

    return () => {
      debouncedPlaceSearch.cancel();
    };
  }, [placeSearchQuery, debouncedPlaceSearch]);

  // Handle place selection
  const handlePlaceSelect = async (place: PlaceSearchResult) => {
    try {
      // Show loading indicator
      setIsSearchingPlaces(true);

      // Get place details including coordinates
      const placeDetails = await placesService.getPlaceDetails(place.id);

      if (placeDetails && placeDetails.geometry?.location) {
        const detailedPlace = {
          ...place,
          latitude: placeDetails.geometry.location.lat,
          longitude: placeDetails.geometry.location.lng,
          // Use formatted address if available
          address: placeDetails.formatted_address || place.address,
        };

        setSelectedPlace(detailedPlace);
        setValue("address", detailedPlace.address);
        setValue("latitude", detailedPlace.latitude);
        setValue("longitude", detailedPlace.longitude);

        // If name is empty, use the place name as default
        if (!watch("name")) {
          setValue("name", detailedPlace.name);
        }
      } else {
        // Fallback if coordinates not found
        Alert.alert("Error", "Could not get coordinates for this location");
        setSelectedPlace(place);
        setValue("address", place.address);
      }
    } catch (error) {
      console.error("Error fetching place details:", error);
      Alert.alert("Error", "Could not get details for this location");
    } finally {
      setIsSearchingPlaces(false);
      setPlaceSearchQuery("");
      setPlaceSearchResults([]);
      Keyboard.dismiss();
    }
  };

  const handleAddLocation = async (data: LocationFormData) => {
    if (!currentUser?._id) {
      Alert.alert("Error", "You must be logged in to save locations");
      return;
    }

    // Validate coordinates
    if (data.latitude === 0 && data.longitude === 0) {
      Alert.alert(
        "Missing Location Data",
        "Please search for a valid location to get accurate coordinates."
      );
      return;
    }

    try {
      if (editingLocation) {
        // Update existing location
        await createOrUpdateLocation({
          userId: currentUser._id,
          locationId: editingLocation._id,
          name: data.name,
          address: data.address,
          type: data.type,
          latitude: data.latitude,
          longitude: data.longitude,
        });
        Alert.alert("Success", "Location updated successfully");
      } else {
        // Add new location
        await createOrUpdateLocation({
          userId: currentUser._id,
          name: data.name,
          address: data.address,
          type: data.type,
          latitude: data.latitude,
          longitude: data.longitude,
        });
        Alert.alert("Success", "Location added successfully");
      }

      setModalVisible(false);
      setEditingLocation(null);
      setSelectedPlace(null);
      reset();
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "An error occurred"
      );
    }
  };

  const handleEditLocation = (location: SavedLocation) => {
    setEditingLocation(location);
    setValue("name", location.name);
    setValue("address", location.address);
    setValue("type", location.type);
    setValue("latitude", location.latitude);
    setValue("longitude", location.longitude);
    setSelectedPlace({
      id: location._id.toString(),
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
    });
    setModalVisible(true);
  };

  const handleDeleteLocation = (locationId: Id<"savedLocations">) => {
    if (!currentUser?._id) {
      Alert.alert("Error", "You must be logged in to delete locations");
      return;
    }

    Alert.alert(
      "Delete Location",
      "Are you sure you want to delete this location?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteLocation({
                userId: currentUser._id,
                locationId: locationId,
              });
            } catch (error) {
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to delete location"
              );
            }
          },
        },
      ]
    );
  };

  const getLocationIcon = (type: LocationType): React.ComponentType<any> => {
    switch (type) {
      case "home":
        return Home;
      case "work":
        return Briefcase;
      default:
        return Heart;
    }
  };

  // Filter locations based on search query
  const filteredLocations = React.useMemo(() => {
    if (!savedLocations || !searchQuery.trim()) {
      // Sort by creation time (newest first) when not filtering
      return savedLocations
        ? [...savedLocations].sort((a, b) => b.createdAt - a.createdAt)
        : [];
    }

    // Filter and then sort the results
    const filtered = savedLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  }, [savedLocations, searchQuery]);

  const renderLocationItem = ({ item }: { item: SavedLocation }) => {
    const LocationIcon = getLocationIcon(item.type);

    return (
      <Card style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.colors.primary.lightest },
            ]}
          >
            <LocationIcon size={20} color={theme.colors.primary.brand} />
          </View>
          <View style={styles.locationInfo}>
            <Typography variant="md" weight="medium">
              {item.name}
            </Typography>
            <Typography
              variant="sm"
              style={{ color: theme.colors.gray[500], marginTop: 2 }}
              numberOfLines={1}
            >
              {item.address}
            </Typography>
          </View>
        </View>
        <View style={styles.locationActions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
            onPress={() => handleEditLocation(item)}
          >
            <Edit2 size={16} color={theme.colors.primary.brand} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.pressed,
            ]}
            onPress={() => handleDeleteLocation(item._id)}
          >
            <Trash2 size={16} color={theme.colors.error} />
          </Pressable>
        </View>
      </Card>
    );
  };

  // Render place search result
  const renderPlaceResult = ({ item }: { item: PlaceSearchResult }) => (
    <TouchableOpacity
      style={styles.placeResultItem}
      onPress={() => handlePlaceSelect(item)}
    >
      <View style={styles.placeResultContent}>
        <MapPin
          size={16}
          color={theme.colors.gray[500]}
          style={styles.placeIcon}
        />
        <View style={styles.placeDetails}>
          <Typography variant="md" weight="medium" numberOfLines={1}>
            {item.name}
          </Typography>
          <Typography
            variant="sm"
            style={{ color: theme.colors.gray[500] }}
            numberOfLines={2}
          >
            {item.address}
          </Typography>
        </View>
      </View>
      <ChevronRight size={16} color={theme.colors.gray[400]} />
    </TouchableOpacity>
  );

  // Determine if we're in a loading state
  const isLoading =
    currentUser === undefined || savedLocations === undefined || isMigrating;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Input
            placeholder="Search saved locations"
            containerStyle={styles.searchInput}
            onChangeText={setSearchQuery}
            value={searchQuery}
            leftIcon={<Search size={16} color={theme.colors.gray[400]} />}
          />
          {searchQuery !== "" && (
            <TouchableOpacity
              onPress={() => setSearchQuery("")}
              style={styles.clearButton}
            >
              <X size={18} color={theme.colors.gray[400]} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Locations List */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary.brand} />
        </View>
      ) : savedLocations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Typography
            variant="md"
            weight="medium"
            style={{ color: theme.colors.gray[500], textAlign: "center" }}
          >
            No saved locations
          </Typography>
          <Typography
            variant="sm"
            style={{
              color: theme.colors.gray[400],
              textAlign: "center",
              marginTop: 8,
            }}
          >
            Add your favorite places for quick access
          </Typography>
        </View>
      ) : filteredLocations.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Typography
            variant="md"
            weight="medium"
            style={{ color: theme.colors.gray[500], textAlign: "center" }}
          >
            No locations match your search
          </Typography>
        </View>
      ) : (
        <FlatList
          data={filteredLocations}
          renderItem={renderLocationItem}
          keyExtractor={(item) => item._id.toString()}
          contentContainerStyle={styles.locationsList}
        />
      )}

      {/* Add Location Button */}
      <View style={styles.addButtonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.floatingAddButton,
            pressed && styles.pressed,
            { backgroundColor: theme.colors.primary.brand },
          ]}
          onPress={() => {
            reset();
            setEditingLocation(null);
            setSelectedPlace(null);
            setPlaceSearchQuery("");
            setPlaceSearchResults([]);
            setModalVisible(true);
          }}
        >
          <Plus size={24} color="white" />
        </Pressable>
      </View>

      {/* Add/Edit Location Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Typography variant="lg" weight="semibold">
                {editingLocation ? "Edit Location" : "Add New Location"}
              </Typography>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setEditingLocation(null);
                  setSelectedPlace(null);
                  reset();
                }}
                style={styles.closeButton}
              >
                <X size={24} color={theme.colors.gray[500]} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Place Search Input */}
              <View style={styles.inputContainer}>
                <Typography
                  variant="sm"
                  weight="medium"
                  style={styles.inputLabel}
                >
                  Search for a place
                </Typography>
                <View style={styles.searchPlaceContainer}>
                  <Input
                    ref={searchInputRef}
                    placeholder="Search for address or place"
                    containerStyle={styles.placeSearchInput}
                    onChangeText={setPlaceSearchQuery}
                    value={placeSearchQuery}
                    leftIcon={
                      <Search size={16} color={theme.colors.gray[400]} />
                    }
                  />
                  {placeSearchQuery !== "" && (
                    <TouchableOpacity
                      onPress={() => {
                        setPlaceSearchQuery("");
                        setPlaceSearchResults([]);
                      }}
                      style={styles.clearButton}
                    >
                      <X size={18} color={theme.colors.gray[400]} />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Place Search Results */}
                {isSearchingPlaces ? (
                  <View style={styles.placeSearchResults}>
                    <ActivityIndicator
                      size="small"
                      color={theme.colors.primary.brand}
                    />
                  </View>
                ) : placeSearchResults.length > 0 ? (
                  <View style={styles.placeSearchResults}>
                    <FlatList
                      data={placeSearchResults}
                      renderItem={renderPlaceResult}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                    />
                  </View>
                ) : null}

                {/* Selected Place */}
                {selectedPlace && !placeSearchQuery && (
                  <View style={styles.selectedPlaceContainer}>
                    <MapPin
                      size={16}
                      color={theme.colors.primary.brand}
                      style={styles.placeIcon}
                    />
                    <View style={styles.selectedPlaceDetails}>
                      <Typography variant="sm" weight="medium">
                        {selectedPlace.name}
                      </Typography>
                      <Typography
                        variant="xs"
                        style={{ color: theme.colors.gray[500] }}
                      >
                        {selectedPlace.address}
                      </Typography>
                    </View>
                    <TouchableOpacity
                      style={styles.changeButton}
                      onPress={() => {
                        setSelectedPlace(null);
                        setValue("address", "");
                        setValue("latitude", 0);
                        setValue("longitude", 0);
                        if (searchInputRef.current) {
                          searchInputRef.current.focus();
                        }
                      }}
                    >
                      <Typography
                        variant="xs"
                        style={{ color: theme.colors.primary.brand }}
                      >
                        Change
                      </Typography>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Location Name */}
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Location Name"
                    placeholder="e.g. Home, Work, Gym"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    error={errors.name?.message}
                    containerStyle={styles.inputContainer}
                  />
                )}
              />

              {/* Hidden Address Field (populated from place selection) */}
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, value } }) => (
                  <Input
                    style={{ display: "none" }}
                    value={value}
                    onChangeText={onChange}
                  />
                )}
              />

              {/* Location Type Selection */}
              <Typography
                variant="sm"
                weight="medium"
                style={{ marginBottom: 8 }}
              >
                Location Type
              </Typography>
              <View style={styles.typeContainer}>
                <Controller
                  control={control}
                  name="type"
                  render={({ field: { onChange, value } }) => (
                    <>
                      <Pressable
                        style={[
                          styles.typeButton,
                          value === "home" && [
                            styles.selectedType,
                            {
                              borderColor: theme.colors.primary.brand,
                              backgroundColor: theme.colors.primary.lightest,
                            },
                          ],
                        ]}
                        onPress={() => onChange("home")}
                      >
                        <Home
                          size={20}
                          color={
                            value === "home"
                              ? theme.colors.primary.brand
                              : theme.colors.gray[500]
                          }
                        />
                        <Typography
                          variant="sm"
                          style={{
                            marginLeft: 8,
                            color:
                              value === "home"
                                ? theme.colors.primary.brand
                                : theme.colors.gray[700],
                          }}
                        >
                          Home
                        </Typography>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.typeButton,
                          value === "work" && [
                            styles.selectedType,
                            {
                              borderColor: theme.colors.primary.brand,
                              backgroundColor: theme.colors.primary.lightest,
                            },
                          ],
                        ]}
                        onPress={() => onChange("work")}
                      >
                        <Briefcase
                          size={20}
                          color={
                            value === "work"
                              ? theme.colors.primary.brand
                              : theme.colors.gray[500]
                          }
                        />
                        <Typography
                          variant="sm"
                          style={{
                            marginLeft: 8,
                            color:
                              value === "work"
                                ? theme.colors.primary.brand
                                : theme.colors.gray[700],
                          }}
                        >
                          Work
                        </Typography>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.typeButton,
                          value === "favorite" && [
                            styles.selectedType,
                            {
                              borderColor: theme.colors.primary.brand,
                              backgroundColor: theme.colors.primary.lightest,
                            },
                          ],
                        ]}
                        onPress={() => onChange("favorite")}
                      >
                        <Heart
                          size={20}
                          color={
                            value === "favorite"
                              ? theme.colors.primary.brand
                              : theme.colors.gray[500]
                          }
                        />
                        <Typography
                          variant="sm"
                          style={{
                            marginLeft: 8,
                            color:
                              value === "favorite"
                                ? theme.colors.primary.brand
                                : theme.colors.gray[700],
                          }}
                        >
                          Favorite
                        </Typography>
                      </Pressable>
                    </>
                  )}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Button
                onPress={() => {
                  setModalVisible(false);
                  setEditingLocation(null);
                  setSelectedPlace(null);
                  reset();
                }}
                variant="secondary"
                style={styles.cancelButton}
                title="Cancel"
              />
              <Button
                onPress={handleSubmit(handleAddLocation)}
                style={styles.saveButton}
                title={editingLocation ? "Update Location" : "Add Location"}
                loading={isSubmitting}
                disabled={!selectedPlace}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 0,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
  },
  clearButton: {
    padding: 4,
  },
  locationsList: {
    padding: 16,
  },
  locationCard: {
    marginBottom: 12,
    padding: 16,
  },
  locationHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  locationInfo: {
    flex: 1,
  },
  locationActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
    backgroundColor: "#F3F4F6",
  },
  pressed: {
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  addButtonContainer: {
    position: "absolute",
    bottom: 24,
    right: 24,
  },
  floatingAddButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  searchPlaceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  placeSearchInput: {
    flex: 1,
  },
  placeSearchResults: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  placeResultItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  placeResultContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  placeIcon: {
    marginRight: 8,
  },
  placeDetails: {
    flex: 1,
  },
  selectedPlaceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  selectedPlaceDetails: {
    flex: 1,
    marginLeft: 8,
  },
  changeButton: {
    padding: 4,
  },
  typeContainer: {
    marginBottom: 16,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedType: {
    borderWidth: 2,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});
