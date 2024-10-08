import React, { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { DropdownItem } from '../../../components/Dropdown';
import Modal from '../../../components/Modal';
import Chip from '../../../components/Chips';
import Label from '../../../components/Label';
import colors from '../../../styles/colors';
import typography from '../../../styles/typography';
import Dropdown from '../../../components/Dropdown';
import notebook from '../../../assets/notebook_white.png';
import useModalStore from '../../../store/useModalStore';
import chat from '../../../assets/chat.png';
import pencil from '../../../assets/pencil.png';
import CalendarInput from '../../../components/CalendarInput';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { postAddType } from '../../../api/StepDetail/postAddType'; 
import { useParams } from 'react-router-dom'; 
import Textfield from '../../../components/Textfield';
import useScheduleStore from '../../../store/useScheduleStore'

const items: DropdownItem[] = [
  { text: '서류 전형', color: `${colors.primary.normal}`, image: notebook },
  { text: '면접 전형', color: `${colors.secondary.normal}`, image: chat },
  { text: '중간 전형(직접 입력)', color: `${colors.neutral[20]}`, image: pencil },
];

interface AddStateModalProps {
  open: boolean;
  onClose: (selectedStep?: DropdownItem) => void;
  onAddState: (newState: StatePayload) => void; 
}

interface StatePayload {
  type: string;
  mid_name: string;
  date: string;
}

const AddStateModal: React.FC<AddStateModalProps> = ({ open, onClose, onAddState }) => {

  const { schedule } = useScheduleStore();
  const [selectedState, setSelectedState] = useState<DropdownItem | null>(null); // 선택된 전형 저장
  const [midName, setMidName] = useState<string>(''); // 중간 전형 입력값 저장
  const [, setStartDate] = useState<Date | null>(null);
  const { date, setDate } = useModalStore();
  
  const { scheduleId } = useParams<{ scheduleId: string }>();

  useEffect(() => {
    if (schedule) {
      // 데이터가 업데이트되면 UI를 리렌더링합니다.
    }
  }, [schedule]);


  const handleConfirm = async () => {
    if (selectedState && scheduleId) {
      try {

        let type: string;
      switch (selectedState.text) {
        case '서류 전형':
          type = 'DOC';
          break;
        case '면접 전형':
          type = 'INT';
          break;
        case '중간 전형(직접 입력)':
          type = 'MID';
          break;
        default:
          type = 'UNKNOWN';
          break;
      }

        const payload = {
          type: type,
          mid_name: midName, 
          date: date ? date.toISOString().split('T')[0] : '', 
        };

        console.log(payload)

        await postAddType(scheduleId, payload);

        const stateType = selectedState.text.replace(' 전형', '');

        onAddState({
          type: stateType,
          mid_name: midName,
          date: payload.date,
        });
      } catch (error) {
        console.error('Error adding state:', error);
      }
    }
    onClose(); // 모달 닫기
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="새로운 전형 추가"
      confirmText="추가하기"
      width="412px"
      height="auto"
      onConfirm={handleConfirm}  // 확인 버튼 클릭 시 handleConfirm 호출
    >
      <Box
        sx={{
          display: 'flex',
          width: '372px',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '24px',
          overflow: 'hidden',
          marginTop: '20px',
          marginBottom: '20px',
        }}
      >
        {/* 전형 단계 박스 */}
        <Box display="flex" width={372} flexDirection="column" alignItems="flex-start" gap="8px">
          <Label label="전형단계" required={true} />
          {/* 전형 선택 드롭다운 */}
          <Box display="flex" flexDirection="row" justify-content={'space-between'} gap={'10px'} align-items={'center'}>
            <Dropdown
              buttonText="전형 단계를 선택해주세요."
              items={items}
              renderItem={(item) => (
                <Chip text={item.text as string} backgroundColor={item.color} sx={{ height: '24px', padding: '4px 8px', gap: '4px' }} />
              )}
              sx={{ width: '195px', height: '44px' }}
              onSelect={(item) => setSelectedState(item)}
            />
            {/* 중간 전형 선택 시에만 Textfield 표시 */}
            {selectedState?.text === '중간 전형(직접 입력)' && (
              <Textfield
                value={midName}
                onChange={(event) => setMidName(event.target.value)}
                placeholder="전형단계명을 입력해주세요"
                showCharCount={false}
                fullWidth={false} 
                height='44px' 
                sx={{ width: '140px' }} 
                />
            )}
          </Box> 
          
        </Box>

        {/* 전형 일자 설정 */}
        <Box display="flex" width={372} flexDirection="column" alignItems="flex-start" gap="8px">
          {/* 일정 선택 데이피커 */}
          <Box>
            <Label label="지원 마감일 또는 전형 진행일" required={true} />
            <Box display="flex" alignItems="center" gap="8px" flexDirection="column" justifyContent="flex-end">
              <DatePicker
                selected={date}
                onChange={(date: Date | null) => setDate(date)}
                dateFormat="yyyy년 MM월 dd일"
                customInput={
                  <CalendarInput
                    value={date ? date.toLocaleDateString() : ''}
                    onClick={() => setStartDate(new Date())} // Update datePicker
                  />
                }
              />
            </Box>
            <Typography mt="4px" style={typography.xxSmallReg} color={colors.neutral[45]}>
              서류 준비중일 경우 지원 마감일을, <br />
              면접 또는 중간전형 준비 중일 경우 진행일을 입력해주세요.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default AddStateModal;