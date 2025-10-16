export type ServerType = {
  creator_hash: string,
  metadata: ServerMetadata,
  // pub time_created: i64,
  // pub users: Vec<String>,
  text_channels: string[],
  // pub voice_channels: Vec<VoiceChannel>,
  voice_channels: {
    [id: string] : VoiceChannel
  },
}

export type ServerMetadata = {
  id: string,
  ticket: string,
  name: string,
  pic: string,
  creator_address: string,
}

export type VoiceChannel = {
  name: string,
  active_users: string[],
}