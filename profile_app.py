import streamlit as st
import time
import json
import tempfile
import os
from gai_utils import gai_client
from veer_client_utils import analyze_profile

# Initialize session state variables
if 'step' not in st.session_state:
    st.session_state.step = 1
if 'recordings' not in st.session_state:
    st.session_state.recordings = []
if 'transcript' not in st.session_state:
    st.session_state.transcript = ""
if 'profile' not in st.session_state:
    st.session_state.profile = {}
if 'recording_status' not in st.session_state:
    st.session_state.recording_status = False
if 'recording_feedback' not in st.session_state:
    st.session_state.recording_feedback = ""
if 'user_name' not in st.session_state:
    st.session_state.user_name = ""

# Set up the page configuration
st.set_page_config(
    page_title="Veer - Profile Creation",
    page_icon="🦁",
    layout="centered",
    initial_sidebar_state="expanded"
)

# Custom styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.5rem;
        color: #FF5A5F;
        text-align: center;
        margin-bottom: 1rem;
    }
    .sub-header {
        font-size: 1.5rem;
        color: #484848;
        margin-bottom: 1rem;
    }
    .card {
        background-color: #F7F7F7;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 20px;
    }
    .highlight {
        background-color: #FFF2CC;
        padding: 5px;
        border-radius: 5px;
    }
    .recording-indicator {
        display: inline-block;
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background-color: red;
        margin-right: 10px;
        animation: pulse 1s infinite;
    }
    @keyframes pulse {
        0% {
            opacity: 1;
        }
        50% {
            opacity: 0.4;
        }
        100% {
            opacity: 1;
        }
    }
    .recording-status {
        color: #FF5A5F;
        font-weight: bold;
        margin-top: 10px;
        margin-bottom: 10px;
    }
</style>
""", unsafe_allow_html=True)

# Header
st.markdown('<div class="main-header">Veer</div>', unsafe_allow_html=True)
st.markdown('<div class="sub-header">Goal Manifestation & Matchmaking Platform</div>', unsafe_allow_html=True)

# Function to transcribe audio using SpeechRecognition
def transcribe_audio(audio_file_path):
    """
    Transcribes audio data using SpeechRecognition library with chunking for longer files
    
    Args:
        audio_file_path (str): Path to the audio file
        
    Returns:
        str: The transcribed text or error message
    """
    import speech_recognition as sr
    from pydub import AudioSegment
    import wave
    import math
    
    # Initialize recognizer
    recognizer = sr.Recognizer()
    
    # Check if the file is short enough to process directly
    with wave.open(audio_file_path, 'rb') as wf:
        frames = wf.getnframes()
        rate = wf.getframerate()
        duration = frames / float(rate)
        
    # If the audio is short (less than 55 seconds), process it directly
    if duration < 55:
        with sr.AudioFile(audio_file_path) as source:
            audio_data = recognizer.record(source)
            return recognizer.recognize_google(audio_data)
    
    # For longer files, use chunking approach
    else:
        # Load with pydub for more format support
        audio = AudioSegment.from_file(audio_file_path)
        audio = audio.set_channels(1)  # Convert to mono
        audio = audio.set_frame_rate(16000)  # Common rate for speech recognition
        
        # Export to a temporary WAV file
        temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
        temp_file_path = temp_file.name
        temp_file.close()
        audio.export(temp_file_path, format="wav")
        
        # Process the exported file in chunks
        with wave.open(temp_file_path, 'rb') as wf:
            frames = wf.getnframes()
            rate = wf.getframerate()
            duration = frames / float(rate)
        
        # Split into 55-second chunks to stay within Google's limits
        chunk_duration = 55
        chunk_size = int(chunk_duration * 16000)  # at 16kHz sample rate
        chunks = math.ceil(duration / chunk_duration)
        
        full_transcript = ""
        
        # Process each chunk
        for i in range(chunks):
            start_time = i * chunk_duration * 1000  # in milliseconds for pydub
            end_time = min((i + 1) * chunk_duration * 1000, len(audio))
            
            # Extract chunk
            audio_chunk = audio[start_time:end_time]
            
            # Save chunk to temporary file
            chunk_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
            chunk_path = chunk_file.name
            chunk_file.close()
            audio_chunk.export(chunk_path, format="wav")
            
            # Transcribe chunk
            with sr.AudioFile(chunk_path) as source:
                audio_data = recognizer.record(source)
                chunk_transcript = recognizer.recognize_google(audio_data)
                full_transcript += " " + chunk_transcript
            
            # Clean up temporary chunk file
            if os.path.exists(chunk_path):
                os.unlink(chunk_path)
        
        # Clean up main temporary file
        if os.path.exists(temp_file_path):
            os.unlink(temp_file_path)
        
        return full_transcript.strip()

# Main app logic based on current step
if st.session_state.step == 1:
    # Step 1: Introduction and Instructions
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### Welcome to Veer! 🙏")
    st.markdown("""
    Veer helps you articulate your goals and connect with like-minded individuals who can support your journey.
    
    In this profile creation process, you'll:
    1. Enter your name and record your voice sharing about yourself
    2. Review the transcription of your recording
    3. See an AI-generated profile based on your responses
    
    Let's begin this journey of courage and determination together.
    """)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Start button
    if st.button("Start Profile Creation", type="primary", key="start_button"):
        st.session_state.step = 2
        st.rerun()

elif st.session_state.step == 2:
    # Step 2: Name Input and Voice Recording
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### Tell Us About Yourself 🎙️")
    
    # Name input
    st.session_state.user_name = st.text_input("Your Name:", value=st.session_state.user_name, key="name_input")
    
    st.markdown("""
    Please respond to the following prompts using your voice. Speak naturally for 1-2 minutes about:
    
    - Your background and current location
    - Your current goals and aspirations
    - What motivates you to achieve these goals
    - Challenges you're facing
    - How you think connecting with others might help you
    """)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Method 1: Try using streamlit-audiorecorder
    try:
        from audiorecorder import audiorecorder
        
        # Recording section with visual indicators
        col1, col2 = st.columns([3, 1])
        
        with col1:
            # Create audio recorder with the visualizer enabled
            audio = audiorecorder(
                "Start Recording", 
                "Stop Recording",
                "", # No pause button
                show_visualizer=True,
                key="audio_recorder"
            )
            
            # Audio recording status display
            if len(audio) > 0:
                # We have a recording
                st.session_state.recording_status = False
                st.session_state.recording_feedback = "Recording saved!"
                
                # Save the audio to a temporary file
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
                    audio.export(temp_audio.name, format="wav")
                    st.session_state.recordings.append(temp_audio.name)
                
                # Display the audio player
                st.audio(audio.export().read(), format="audio/wav")
                
                # Display duration
                st.write(f"Recording duration: {audio.duration_seconds:.2f} seconds")
            else:
                # Display recording status indicator
                recording_status = st.empty()
                if st.session_state.recording_feedback:
                    recording_status.markdown(f'<div class="recording-status">{st.session_state.recording_feedback}</div>', unsafe_allow_html=True)
        
        with col2:
            # Show animated recording indicator if we're recording
            if st.session_state.recording_status:
                st.markdown('<div class="recording-indicator"></div> Recording...', unsafe_allow_html=True)
    
    # Method 2: Fallback to native st.audio_input (Streamlit 1.27.0+)
    except ImportError:
        try:
            st.info("Using Streamlit's native audio recording. Please click the microphone to record.")
            
            # Use Streamlit's native audio recorder
            audio_bytes = st.audio_input("Click to record your introduction", key="native_recorder")
            
            if audio_bytes:
                # Save the recording to a temporary file
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as temp_audio:
                    temp_audio.write(audio_bytes)
                    st.session_state.recordings.append(temp_audio.name)
                
                # Display the audio player
                st.audio(audio_bytes, format="audio/wav")
                st.session_state.recording_feedback = "Recording saved!"
        
        # Method 3: Allow file upload as last resort
        except (ImportError, AttributeError):
            st.warning("Audio recording components not available. Please upload an audio file instead.")
            
            uploaded_file = st.file_uploader("Upload an audio recording (WAV, MP3, etc.)", 
                                            type=["wav", "mp3", "m4a", "ogg"],
                                            key="file_uploader")
            
            if uploaded_file is not None:
                # Save the uploaded file to a temporary file
                with tempfile.NamedTemporaryFile(suffix="." + uploaded_file.name.split(".")[-1], delete=False) as temp_audio:
                    temp_audio.write(uploaded_file.getvalue())
                    st.session_state.recordings.append(temp_audio.name)
                
                # Display the audio player
                st.audio(uploaded_file.getvalue())
                st.session_state.recording_feedback = "Audio file saved!"
    
    # Option to continue or re-record (only show if we have a recording)
    if len(st.session_state.recordings) > 0:
        col1, col2 = st.columns(2)
        with col1:
            if st.button("Re-record", key="rerecord_button"):
                # Remove the temporary file
                try:
                    os.unlink(st.session_state.recordings[-1])
                except:
                    pass
                st.session_state.recordings.pop()
                st.session_state.recording_feedback = "Ready to record again."
                st.rerun()
        with col2:
            if st.button("Continue", type="primary", key="continue_button"):
                if not st.session_state.user_name:
                    st.error("Please enter your name before continuing.")
                else:
                    st.session_state.step = 3
                    st.rerun()

elif st.session_state.step == 3:
    # Step 3: Speech to Text Conversion
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### Converting Your Speech to Text... 📝")
    st.markdown("Please wait while we process your recording.")
    st.markdown('</div>', unsafe_allow_html=True)
    
    progress_bar = st.progress(0)
    status_text = st.empty()
    
    for percent_complete in range(100):
        # Simulate processing time
        time.sleep(0.01)
        progress_bar.progress(percent_complete + 1)
        status_text.text(f"Processing: {percent_complete + 1}%")
        
    if st.session_state.recordings:
        latest_recording = st.session_state.recordings[-1]
        status_text.text(f"Transcribing audio file: {latest_recording}")
        
        # Actually transcribe the audio
        transcript = transcribe_audio(latest_recording)
        st.session_state.transcript = transcript
        status_text.text("Transcription complete!")
    else:
        st.error("No recording found to transcribe!")
    
    # Move to next step
    st.session_state.step = 4
    st.rerun()

elif st.session_state.step == 4:
    # Step 4: Review and Edit Transcript
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### Review Your Transcript ✍️")
    st.markdown("Below is the transcription of your recording. You can edit it if needed.")
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Display and allow editing of the transcript
    edited_transcript = st.text_area("Edit your transcript if needed:", 
                                    value=st.session_state.transcript, 
                                    height=300)
    st.session_state.transcript = edited_transcript
    
    # Add buttons in columns
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Go Back", key="go_back_button"):
            st.session_state.step = 2  # Go back to recording step
            st.rerun()
    with col2:
        if st.button("Generate Profile", type="primary", key="generate_profile_button"):
            st.session_state.step = 5
            st.rerun()

elif st.session_state.step == 5:
    # Step 5: Generate and Display Profile
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### Analyzing and Generating Your Profile... 🧠")
    st.markdown("Please wait while our AI analyzes your responses.")
    st.markdown('</div>', unsafe_allow_html=True)
    
    progress_bar = st.progress(0)
    
    for percent_complete in range(100):
        time.sleep(0.02)
        progress_bar.progress(percent_complete + 1)
    
    # Initialize gai client
    gai = gai_client()
    
    # Properly prepend the name to the transcript if it's not already there
    transcript_with_name = st.session_state.transcript
    if not transcript_with_name.lower().startswith(f"my name is {st.session_state.user_name.lower()}"):
        transcript_with_name = f"My name is {st.session_state.user_name}. " + transcript_with_name
    
    # Call the LLM to analyze the profile
    st.session_state.profile = analyze_profile(transcript_with_name, model="o4-mini")
    
    # Force the name from the text input into the profile
    if "outward_profile" in st.session_state.profile:
        st.session_state.profile["outward_profile"]["name"] = st.session_state.user_name
    
    st.session_state.step = 6
    st.rerun()

elif st.session_state.step == 6:
    # Step 6: Display Profile
    # Display Outward Profile
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### Your Veer Profile 📊")
    st.markdown("Here's your profile based on your responses. This outward profile will be visible to potential connections.")
    
    outward = st.session_state.profile["outward_profile"]
    
    # Display name with fallback to the user input name
    name = outward.get('name', st.session_state.user_name)
    st.markdown(f"#### {name}")
    
    # Display background with safety checks
    background = outward.get('background', {})
    origin = background.get('origin', 'Unknown')
    current_location = background.get('current_location', 'Unknown')
    time_in_location = background.get('time_in_current_location', 'some time')
    profession = background.get('profession', 'Not specified')
    
    st.markdown(f"**Background:** Originally from {origin}, currently in {current_location} for {time_in_location}")
    st.markdown(f"**Profession:** {profession}")
    
    # Display goals with safety checks
    st.markdown("**Goals:**")
    goals = outward.get('goals', [])
    if goals:
        for goal in goals:
            primary = goal.get('primary', 'Not specified')
            secondary = goal.get('secondary', 'Not specified')
            st.markdown(f"- Primary: {primary}")
            st.markdown(f"- Secondary: {secondary}")
    else:
        st.markdown("- No specific goals provided")
    
    # Display motivations with safety checks
    st.markdown("**Motivations:**")
    motivations = outward.get('motivations', [])
    if motivations:
        for motivation in motivations:
            st.markdown(f"- {motivation}")
    else:
        st.markdown("- No specific motivations provided")
    
    # Display challenges with safety checks
    st.markdown("**Challenges:**")
    challenges = outward.get('challenges', [])
    if challenges:
        for challenge in challenges:
            st.markdown(f"- {challenge}")
    else:
        st.markdown("- No specific challenges provided")
    
    # Display connection needs with safety checks
    st.markdown("**Looking to Connect With:**")
    connection_needs = outward.get('connection_needs', [])
    if connection_needs:
        for need in connection_needs:
            st.markdown(f"- {need}")
    else:
        st.markdown("- No specific connection needs provided")
    
    # Display skills with safety checks
    st.markdown("**Skills:**")
    skills = outward.get('skills', [])
    if skills:
        for skill in skills:
            st.markdown(f"- {skill}")
    else:
        st.markdown("- No specific skills provided")
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Display Inward Profile (expanded by default but can be collapsed)
    st.markdown('<div class="card">', unsafe_allow_html=True)
    with st.expander("Inward Profile (For Matching Algorithm)", expanded=True):
        st.markdown("This internal profile helps our algorithm find the best matches for you. This information is not shared publicly.")
        
        inward = st.session_state.profile.get("inward_profile", {})
        
        # Display personality traits with safety checks
        st.markdown("**Personality Traits:**")
        personality_traits = inward.get("personality_traits", {})
        if personality_traits:
            for trait, value in personality_traits.items():
                st.markdown(f"- **{trait.title()}:** {value}")
        else:
            st.markdown("- Personality traits not assessed")
        
        # Display communication style with safety checks
        st.markdown("**Communication Style:**")
        communication_style = inward.get("communication_style", {})
        if communication_style:
            for style, value in communication_style.items():
                st.markdown(f"- **{style.title()}:** {value}")
        else:
            st.markdown("- Communication style not assessed")
        
        # Display psychological insights with safety checks
        st.markdown("**Psychological Insights:**")
        psychological_insights = inward.get("psychological_insights", {})
        if psychological_insights:
            for insight, value in psychological_insights.items():
                st.markdown(f"- **{insight.replace('_', ' ').title()}:** {value}")
        else:
            st.markdown("- Psychological insights not available")
        
        # Display believability assessment with safety checks
        st.markdown("**Believability Assessment:**")
        believability_assessment = inward.get("believability_assessment", {})
        if believability_assessment:
            for factor, value in believability_assessment.items():
                st.markdown(f"- **{factor.replace('_', ' ').title()}:** {value}")
        else:
            st.markdown("- Believability assessment not available")
        
        # Display potential concerns with safety checks
        st.markdown("**Potential Concerns:**")
        potential_concerns = inward.get("potential_concerns", {})
        if potential_concerns:
            for concern, value in potential_concerns.items():
                st.markdown(f"- **{concern.replace('_', ' ').title()}:** {value}")
        else:
            st.markdown("- No specific concerns identified")
        
        # Display matching recommendations with safety checks
        st.markdown("**Matching Recommendations:**")
        matching_recommendations = inward.get("matching_recommendations", {})
        if matching_recommendations:
            for rec_type, values in matching_recommendations.items():
                if isinstance(values, list) and values:
                    st.markdown(f"- **{rec_type.replace('_', ' ').title()}:** {', '.join(values)}")
                else:
                    st.markdown(f"- **{rec_type.replace('_', ' ').title()}:** No specific recommendations")
        else:
            st.markdown("- Matching recommendations not available")
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Next steps
    st.markdown('<div class="card">', unsafe_allow_html=True)
    st.markdown("### Next Steps")
    st.markdown("""
    Your profile has been created! Here's what happens next:
    
    1. Our matching algorithm will find potential connections based on your profile
    2. You'll receive notifications when we find good matches for your goals
    3. You can edit your profile anytime through your settings
    
    Thank you for joining Veer! 🙏
    """)
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Clean up temporary files when done
    if st.session_state.recordings:
        for recording_path in st.session_state.recordings:
            try:
                if os.path.exists(recording_path):
                    os.unlink(recording_path)
            except Exception as e:
                st.warning(f"Could not remove temporary file {recording_path}: {e}")
    
    # Updated navigation buttons with Edit Transcript option
    col1, col2, col3 = st.columns(3)
    with col1:
        if st.button("Edit Transcript", key="edit_transcript_button"):
            st.session_state.step = 4  # Return to transcript editing
            st.rerun()
    with col2:
        if st.button("Start Over", key="start_over_button"):
            for key in st.session_state.keys():
                del st.session_state[key]
            st.rerun()
    with col3:
        if st.button("Continue to Dashboard", type="primary", key="dashboard_button"):
            st.success("Profile created successfully! Redirecting to dashboard...")
            # In a real app, you would redirect to the dashboard here

# Add a sidebar with additional information
with st.sidebar:
    st.image("logo.png", width=150)
    st.markdown("### About Veer")
    st.markdown("""
    Veer is a goal manifestation and intelligent matchmaking platform designed specifically for Nepali communities both in Nepal and the Nepali diaspora in America.
    
    The name "Veer" (meaning brave/courageous in Sanskrit) embodies our core philosophy: approaching goals with courage and finding strength through community connections.
    """)
    
    st.markdown("### Need Help?")
    st.markdown("Contact us at help@veerapp.com")