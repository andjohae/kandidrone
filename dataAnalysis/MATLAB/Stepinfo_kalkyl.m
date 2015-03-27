clear all;
clc;
clf;
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%Set input file and plot limits. All you have to do! :)
<<<<<<< HEAD
n = 'mission-2015-03-06_04-21-41';
name = strcat(n,'.txt');
=======
name = 'mission-2015-03-10_06-44-42.txt';
>>>>>>> 04426ff041cc4dfd1af1c4e9245aa1a866c52003
xmin = 0;   %xmax set automatically
ymin = -2;
ymax = 2;
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%If file contains 'Infinity', textscan will return error
%Resolve this by replacing every occurence with 'NaN'
%That can be done in a texteditor or with the following
%Terminal command when standing in the appropriate directory:
%sed -i.bak s/NaN/Kalle/g $name')
%where '$name' is the filename.
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%Uncomment valid path

filename = strcat('/Users/Adam-MBP/Documents/Kandidatarbete/Github/kandidrone/dataAnalysis/Logfiler/all/',name);
%filename = strcat('/Users/emilrosenberg/Dropbox/Kandidatarbete/Matdata/Logfiler/kommenterade/',name);
%filename = strcat('/Users/JoachimBenjaminsson/Dropbox/Kandidatarbete/Matdata/Logfiler/kommenterade/',name);
%filename = strcat('/Users/kalle/Documents/Pill/GitHub/kandidrone/dataAnalysis/Logfiler/kommenterade/',name);
delimiter = ',';
%Format
formatSpecNum = '%f%f%f%f%f%f%f%f%f%s%f%f%f%f%f%f%f%f%[^\n\r]';
%Open file
fileID = fopen(filename,'r');
%Read data
dataArray = textscan(fileID, formatSpecNum, 'Delimiter', delimiter,  'ReturnOnError', false);
%Close file
fclose(fileID);
%Allocate imported array to column variable names
State_x = dataArray{:, 1};
State_y = dataArray{:, 2};
State_z = dataArray{:, 3};
State_yaw = dataArray{:, 4};
State_vx = dataArray{:, 5};
State_vy = dataArray{:, 6};
Goal_x = dataArray{:, 7};
Goal_y = dataArray{:, 8};
Goal_z = dataArray{:, 9};
Goal_yaw = dataArray{:, 10};
Ex = dataArray{:, 11};
Ey = dataArray{:, 12};
Ez = dataArray{:, 13};
Eyaw = dataArray{:, 14};
Control_ux = dataArray{:, 15};
Control_uy = dataArray{:, 16};
Control_uz = dataArray{:, 17};
Control_uyaw = dataArray{:, 18};

%%Clear temporary variables
clearvars filename delimiter formatSpec fileID dataArray ans;

%% Plot all data
%{

deltaT = 1/15;
t=linspace(1,length(State_x),length(State_x));
t=t';
t=t.*deltaT;
 
numRows = 3;
numCols = 2;
axisVector = [xmin t(length(t)) ymin ymax];

figure(1)
subplot(numRows,numCols,1)
hold on
plot(t,State_x)
plot(t,State_y)
plot(t,State_z)
plot(t,State_yaw)
plot([t(1),t(length(t))],[0,0],'k')
plot([t(1),t(length(t))],[1,1],'k')
hold off
legend('State x','State y','State z','State yaw');
title('States-positions');
text(0, 1.5, name, 'Color', 'r');
axis(axisVector);
xlabel('Tid [s]')
ylabel('Amplitud [m]')

subplot(numRows,numCols,2)
hold on
plot(t,State_vx)
plot(t,State_vy)
plot([t(1),t(length(t))],[0,0],'k')
hold off
title('States-velocities');
legend('State vx','State vy');
axis(axisVector);
xlabel('Tid [s]')

subplot(numRows,numCols,3)
hold on
plot(t,Goal_x)
plot(t,Goal_y)
plot(t,Goal_z)
plot([t(1),t(length(t))],[0,0],'k')
hold off
title('Goals-positions');
legend('Goal x','Goal y','Goal z');
axis(axisVector);
xlabel('Tid [s]')

subplot(numRows,numCols,4)
hold on
plot(t,Ex)
plot(t,Ey)
plot(t,Ez)
plot(t,Eyaw)
plot([t(1),t(length(t))],[0,0],'k')
hold off
title('Errors-positions');
legend('Ex','Ey','Ez','Eyaw');
axis(axisVector);
xlabel('Tid [s]')

subplot(numRows,numCols,5)
hold on
plot(t,Control_ux)
plot(t,Control_uy)
plot(t,Control_uz)
plot(t,Control_uyaw)
plot([t(1),t(length(t))],[0,0],'k')
hold off
title('Control signals from PID');
legend('Control_ux','Control_uy','Control_uz','Control_uyaw');
axis(axisVector);
xlabel('Tid [s]')
%}
%% Stepinfo
clf;
clc;
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%Choose which state to monitor
chosenState = 'y';    % x,y or z
%Remove points at end of step if no SettlingTime is found min 1
shift = 30;
%Set tolerance [%] used by SettlingTime
ST=0.05;
%Parameters in chosen state [Kp,Ki,Kd]
KParameters = [0.5,0.01,0.35];
%Set axis values for plot [xmin 0 ymin ymax] xmax is set automatically
axisLimits = [0 0 0.5 1.1];
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%Extract chosen data
if chosenState == 'x'
    Goal = Goal_x;
    State = State_x;
elseif chosenState == 'y'
    Goal = Goal_y;
    State = State_y;
else
    Goal = Goal_z;
    State = State_z;
end

%Prepare t-vector
deltaT = 1/15;
t=linspace(1,length(State),length(State));
t=t';
t=t.*deltaT;

%Plot steps and responses for reference. Obs! must comment
%clf; further down first
%{
figure(2)
subplot(3,1,1)
title('x-koordinat')
hold on
plot(t,Goal_x)
plot(t,State_x)
legend('x-goal','x-state');
hold off

subplot(3,1,2)
title('y-koordinat')
hold on
plot(t,Goal_y)
plot(t,State_y)
legend('y-goal','y-state');
hold off

subplot(3,1,3)
title('z-koordinat')
hold on
plot(t,Goal_z)
plot(t,State_z)
legend('z-goal','z-state');
hold off
%}

%Extract startIndex and endIndex
%Set stepvalues (base and top)
baseValue = min(Goal);
topValue = max(Goal);
startIndex = 0;
endIndex = length(Goal);    %If step continues till EOF
                            %let last position be EOF
i = 1;
while i<length(Goal)
    if Goal(i)==topValue
       startIndex = i;
       break;
    end
    i = i+1;
end
while i<length(Goal)
    if Goal(i)==baseValue
       endIndex = i;
       break;
    end
    i = i+1;
end

%Extract important information 
partStep = State(startIndex:endIndex-shift);
partGoal = Goal(startIndex:endIndex-shift);
partT = t(startIndex:endIndex-shift);
partT = partT-min(partT);   %Set t=0 at start of step

%Set xmax to last time position
axisLimits(2) = max(partT);

%Plot step for reference
clf;
hold on
plot(partT,partStep)
plot(partT,partGoal)
hold off
legend('Step','Goal')
xlabel('Tid[s]')
ylabel('Distans[m]')
title(strcat(name,'--Steg i ledden:',chosenState))
axis(axisLimits)
grid on
%Get stepinfo
Stepinfo=stepinfo(partStep, partT, topValue,'SettlingTimeThreshold',ST);

%Extract step info to variables for easy handling
numData=zeros(8,1);
numData(1)      = getfield(Stepinfo,'RiseTime');
numData(2)      = getfield(Stepinfo,'SettlingTime');
numData(3)      = getfield(Stepinfo,'SettlingMin');
numData(4)      = getfield(Stepinfo,'SettlingMax');
numData(5)      = getfield(Stepinfo,'Overshoot');
numData(6)      = getfield(Stepinfo,'Undershoot');
numData(7)      = getfield(Stepinfo,'Peak');
numData(8)      = getfield(Stepinfo,'PeakTime');
%{
RiseTime        = getfield(Stepinfo,'RiseTime');
SettlingTime    = getfield(Stepinfo,'SettlingTime');
SettlingMin     = getfield(Stepinfo,'SettlingMin');
SettlingMax     = getfield(Stepinfo,'SettlingMax');
Overshoot       = getfield(Stepinfo,'Overshoot');
Undershoot      = getfield(Stepinfo,'Undershoot');
Peak            = getfield(Stepinfo,'Peak');
PeakTime        = getfield(Stepinfo,'PeakTime');
%}
%Convert to strings
stringData = num2str(numData);

%Collect fieldnames
fieldnames = {  'RiseTime';
                'SettlingTime';
                'SettlingMin';
                'SettlingMax';
                'Overshoot';
                'Undershoot';
                'Peak';
                'PeakTime'};
%Convert fieldnames to char array for printing
fieldnames = char(fieldnames);

%Display stepinfo with correct units
%{
disp(strcat('Chosen state: ',chosenState))
disp(strcat('RiseTime:',num2str(RiseTime),'[s]'))
disp(strcat('Tolerance of SettlingTime:',num2str(100*ST),' [%]'))
disp(strcat('SettlingTime:',num2str(SettlingTime),'[s]'))
disp(strcat('SettlingMin:',num2str(SettlingMin),'[m]'))
disp(strcat('SettlingMax:',num2str(SettlingMax),'[m]'))
disp(strcat('Overshoot:',num2str(Overshoot),'[%]'))
disp(strcat('Undershoot:',num2str(Undershoot),'[%]'))
disp(strcat('Peak:',num2str(Peak),'[m]'))
disp(strcat('PeakTime:',num2str(PeakTime),'[s]'))
%}

%Specify format for numbers. Show 10 decimals in order to get nice columns
%in file.
formatSpecNum = '%.10f\t%.10f\t%.10f\t%.10f\t%.10f\t%.10f\t%.10f\t%.10f\n';
formatSpecParam = '%.3f\t%.3f\t%.3f\t';

%Specify file to write data into. Use 'w' to replace existing file; 'a' to
%append to existing file.
fileID = fopen('./stepinfo/measuredData.txt','a');

%Generate file header when file is created, then comment out.
%{
fprintf(fileID,'Name                           \t');
sarray={'State','Kp','Ki','Kd'};
sarray=char(sarray);
for i=1:size(sarray,1)
    fprintf(fileID,char(sarray(i,:)));
    fprintf(fileID,'\t');
end
for i=1:size(fieldnames,1)
    fprintf(fileID,char(fieldnames(i,:)));
    fprintf(fileID,'\t');
end
fprintf(fileID,'\n');
%}

%Print data on newline
fprintf(fileID,strcat(name,'\t'));
fprintf(fileID,strcat(chosenState,'    \t'));
fprintf(fileID,formatSpecParam,KParameters);
fprintf(fileID,formatSpecNum,numData);
fclose(fileID);

%Print plot to file
print(strcat('./stepinfo/plots/',n),'-dpng')
%% Old code by Adam and Emil
%{

%Feltolerans
t_err=0.1;

% X
startix=0;
endix=0;
for i=1:length(Goal_x)
    if (Goal_x(i)==max(Goal_x) && startix==0 && length(unique(Goal_x))~=1)
        startix=i;
        break
    end
end

% Y
for i=length(Goal_x):-1:1
    if (Goal_x(i)==max(Goal_x) && endix==0 && length(unique(Goal_x))~=1)
        endix=i;
        break
    end
end


% Z
startiy=0;
endiy=0;
for i=1:length(Goal_y)
    if (Goal_y(i)==max(Goal_y) && startiy==0 && length(unique(Goal_y))~=1)
        startiy=i;
        break
    end
end

for i=length(Goal_y):-1:1
    if (Goal_y(i)==max(Goal_y) && endiy==0 && length(unique(Goal_y))~=1)
        endiy=i;
        break
    end
end


startiz=0;
endiz=0;
for i=1:length(Goal_z)
    if (Goal_z(i)==max(Goal_z) && startiz==0 && length(unique(Goal_z))~=1)
        startiz=i;
        break
    end
end

for i=length(Goal_z):-1:1
    if (State_z(i)>=max(Goal_z) && endiz==0 && length(unique(Goal_z))~=1)
        endiz=i;
        break
    end
end

if(startix~=0)
tx=(startix:endix);
stax=State_x(startix:endix);
Sx=stepinfo(State_x(startix:endix),tx)
end

if(startiy~=0)
ty=(startiy:endiy);
stay=State_y(startiy:endiy);
Sy=stepinfo(State_y(startiy:endiy),ty)
end

if(startiz~=0)
tz=(startiz:endiz);
staz=State_z(startiz:endiz);
Sz=stepinfo(State_z(startiz:endiz),tz,max(Goal_z),'SettlingTimeThreshold',0.1)
end
%}