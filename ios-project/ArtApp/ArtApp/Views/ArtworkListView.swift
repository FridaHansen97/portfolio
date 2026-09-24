import SwiftUI

struct ArtworkListView: View {
    @Environment(\.artworkRepository) private var artworkRepository
    
    @State private var isLoading = false
    @State private var errorMessage: String?
    
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
                } else {
                    ScrollView {
                        LazyVGrid(columns: columns, spacing: 16) {
                            ForEach(artworksWithImages) { artwork in
                                ArtworkCard(artwork: artwork)
                            }
                        }
                        .padding()
                    }
                }
            }
                .navigationTitle("Artworks")
                .task {
                    guard artworkRepository.artworks.isEmpty else { return }
                    await loadArtworks()
                }
        }
        
        private func loadArtworks() async {
            isLoading = true
            errorMessage = nil
            defer { isLoading = false}
            
            do {
                try await artworkRepository.fetchArtworks(query: "")
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
    }
