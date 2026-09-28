import SwiftUI
import SwiftData

struct ArtworkListView: View {
    @Environment(\.artworkRepository) private var artworkRepository
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    @State private var searchText = ""
    @State private var loadedQuery: String?
    
    private let columns = [GridItem(.adaptive(minimum: 150), spacing: 12)]
    private var artworksWithImages: [Artwork] {
        artworkRepository.artworks.filter { $0.imageURL != nil }
    }
    
    var body: some View {
        Group {
            if let errorMessage {
                ContentUnavailableView {
                    Label("Could not load artworks", systemImage: "wifi.exclamationmark")
                } description: {
                    Text(errorMessage)
                }actions: {
                    Button("Try Again") {
                        Task { await loadArtworks() }
                    }
                }
            } else if isLoading && artworksWithImages.isEmpty {
                ProgressView("Loading artworks...")
            }else if artworksWithImages.isEmpty && !searchText.isEmpty {
                ContentUnavailableView.search(text: searchText)
            } else {
                ScrollView {
                    LazyVGrid(columns: columns, spacing: 16) {
                        ForEach(artworksWithImages) { artwork in
                            NavigationLink(value: artwork) {
                                ArtworkCard(artwork: artwork)
                            }
                            .buttonStyle(.plain)
                            .overlay(alignment: .topTrailing) {
                                FavoriteButton(artwork: artwork)
                                    .padding(6)
                            }
                        }
                    }
                    .padding()
                }
            }
        }
        .navigationTitle("Artworks")
        .navigationDestination(for: Artwork.self) { artwork in
            ArtworkDetailView(artwork: artwork)
        }
        .searchable(text: $searchText, prompt: "Search artworks")
        .task(id: searchText) {
            guard searchText != loadedQuery else { return }
            
            if !searchText.isEmpty {
                try? await Task.sleep(for: .milliseconds(500))
                guard !Task.isCancelled else { return }
            }
            await loadArtworks()
        }
    }
    
    private func loadArtworks() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false}
        
        do {
            try await artworkRepository.fetchArtworks(query: searchText)
            loadedQuery = searchText
        }catch let error as URLError where error.code == .cancelled {
            return
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

#Preview {
    NavigationStack {
        ArtworkListView()
    }
    .environment(\.artworkRepository, ArtworkRepository())
    .modelContainer(for: FavoriteArtwork.self, inMemory: true)
}
